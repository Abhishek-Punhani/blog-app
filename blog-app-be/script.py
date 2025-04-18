import os
import json
import asyncio
import argparse
import ssl
from functools import lru_cache
from datetime import datetime
from typing import Dict, List
import aiohttp
import google.generativeai as genai
CONFIG = {
    "gemini_api_key": os.getenv("GEMINI_API_KEY"),
    "newsdata_api_key": os.getenv("NEWSDATA_API_KEY", ""),
    "output_dir": "blog_output",
    "cache_expiry": 3600
}

try:
    genai.configure(api_key=CONFIG["gemini_api_key"])
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error initializing Gemini: {e}")
    model = None

class BlogAgent:
    """Main blog writing agent"""
    
    def __init__(self, topic: str, tone: str = "educational"):
        self.topic = topic
        self.tone = tone
        self.metadata = {
            "slug": self.create_default_slug(),
            "keywords": [],
            "quotes": [],
            "title": "",
            "description": "",
            "reading_time": 1
        }
        self.content = ""
        self.session = None
        
    def create_default_slug(self) -> str:
        """Create basic slug from topic"""
        return (
            self.topic.lower()
            .replace(" ", "-")
            .replace("'", "")
            .replace('"', "")
            .replace(",", "")
            .replace(".", "")[:50]
        )
        
    async def __aenter__(self):
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        self.session = aiohttp.ClientSession(connector=connector)
        return self
        
    async def __aexit__(self, exc_type, exc, tb):
        if self.session:
            await self.session.close()
    
    async def research_topic(self) -> Dict:
        """Conduct research using various APIs"""
        print("Researching topic...")
        
        tasks = [
            self.fetch_news_articles(),
            self.fetch_related_keywords(),
            self.fetch_relevant_quotes()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "news": results[0] if not isinstance(results[0], Exception) else [],
            "keywords": results[1] if not isinstance(results[1], Exception) else [],
            "quotes": results[2] if not isinstance(results[2], Exception) else []
        }
    
    @lru_cache(maxsize=128)
    async def fetch_news_articles(self) -> List[Dict]:
        """Fetch news articles"""
        if not CONFIG["newsdata_api_key"]:
            return []
            
        try:
            url = "https://newsdata.io/api/1/news"
            params = {
                "apikey": CONFIG["newsdata_api_key"],
                "q": self.topic,
                "language": "en",
                "size": 3
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("results", [])
                return []
        except Exception as e:
            print(f"Warning: News fetch failed - {str(e)}")
            return []
    
    @lru_cache(maxsize=128)
    async def fetch_related_keywords(self) -> List[str]:
        """Fetch related keywords"""
        try:
            url = "https://api.datamuse.com/words"
            params = {
                "ml": self.topic,
                "max": 10
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [item["word"] for item in data]
                return []
        except Exception as e:
            print(f"Warning: Keyword fetch failed - {str(e)}")
            return []
    
    @lru_cache(maxsize=128)
    async def fetch_relevant_quotes(self) -> List[str]:
        """Fetch relevant quotes with relaxed SSL"""
        try:
            url = "https://api.quotable.io/search/quotes"
            params = {
                "query": self.topic,
                "limit": 2
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        f'"{q["content"]}" - {q["author"]}'
                        for q in data.get("results", [])
                    ]
                return []
        except Exception as e:
            print(f"Warning: Quote fetch failed (SSL issues) - {str(e)}")
            return []
    
    async def generate_content(self, research_data: Dict):
        """Generate blog content"""
        print("Generating content...")
        
        if not model:
            self.content = "Content generation unavailable - check API key"
            return
            
        keywords = ", ".join(research_data.get("keywords", []))
        quotes = "\n".join(research_data.get("quotes", []))
        news_summary = "\n".join(
            [f"- {article.get('title', '')}" for article in research_data.get("news", [])]
        )
        outline_prompt = (
            f"Create a detailed outline for a blog about '{self.topic}', "
            f"tone: {self.tone}. Include relevant keywords: {keywords}. "
            f"Incorporate these quotes:\n{quotes}\n"
            f"Consider recent news:\n{news_summary}"
        )
        outline = await self.call_gemini(outline_prompt)
        self.metadata["outline"] = outline
        
        intro_prompt = (
            f"Write an engaging introduction for a blog about '{self.topic}', "
            f"tone: {self.tone}. Include some keywords: {keywords}."
        )
        introduction = await self.call_gemini(intro_prompt)
        self.content += f"# {self.topic}\n\n{introduction}\n\n"
        
        sections = [line for line in outline.split('\n') if line.strip().startswith('##')]
        for section in sections:
            section_title = section.replace('##', '').strip()
            section_prompt = (
                f"Write a detailed section titled '{section_title}' for a blog about '{self.topic}', "
                f"tone: {self.tone}. Include relevant keywords: {keywords}. "
                f"Incorporate a quote if relevant:\n{quotes}"
            )
            section_content = await self.call_gemini(section_prompt)
            self.content += f"## {section_title}\n\n{section_content}\n\n"
        conclusion_prompt = (
            f"Write a compelling conclusion for a blog about '{self.topic}', "
            f"tone: {self.tone}. Summarize key points and include a call to action."
        )
        conclusion = await self.call_gemini(conclusion_prompt)
        self.content += f"## Conclusion\n\n{conclusion}\n\n"
    
    async def call_gemini(self, prompt: str, max_retries: int = 3) -> str:
        """Call Gemini API with retry logic"""
        if not model:
            return "Content generation unavailable - check API key"
            
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt
                )
                return response.text
            except Exception as e:
                if attempt == max_retries - 1:
                    return f"Content generation failed: {str(e)}"
                await asyncio.sleep(2 ** attempt)
        return ""
    
    async def optimize_seo(self):
        """Optimize for SEO"""
        print("Optimizing for SEO...")
        
        title_prompt = f"Create a concise, SEO-optimized title (60-70 characters) for a blog about: {self.topic}"
        self.metadata["title"] = (await self.call_gemini(title_prompt)).strip('"')
        
        desc_prompt = f"Write a meta description (150-160 characters) for a blog about: {self.topic}"
        self.metadata["description"] = (await self.call_gemini(desc_prompt))[:160]
        
        if not self.metadata["keywords"]:
            keyword_prompt = f"Generate 5-8 SEO keywords for a blog about: {self.topic}"
            keywords = await self.call_gemini(keyword_prompt)
            self.metadata["keywords"] = [k.strip() for k in keywords.split(',') if k.strip()]
        
        if not self.metadata.get("slug"):
            slug_prompt = f"Create a URL-friendly slug for a blog titled: {self.metadata['title']}"
            self.metadata["slug"] = (
                await self.call_gemini(slug_prompt)
            ).lower().replace(' ', '-').replace('"', '').replace("'", "").strip("-")
        
        word_count = len(self.content.split())
        self.metadata["reading_time"] = max(1, round(word_count / 200))
    
    async def export_blog(self):
        """Export blog files (optional for CLI use)"""
        print("Exporting results...")
        
        os.makedirs(CONFIG["output_dir"], exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.metadata['slug']}_{timestamp}"
        
        with open(f"{CONFIG['output_dir']}/{filename}.md", 'w') as f:
            f.write(self.content)
        
        with open(f"{CONFIG['output_dir']}/{filename}.json", 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def display_summary(self):
        """Display generation summary (optional for CLI use)"""
        print("\nBlog Generation Complete!")
        print("=" * 40)
        print(f"Title: {self.metadata['title']}")
        print(f"Description: {self.metadata['description']}")
        print(f"Slug: {self.metadata['slug']}")
        print(f"Reading Time: {self.metadata['reading_time']} min")
        print(f"Keywords: {', '.join(self.metadata['keywords'])}")
        print("=" * 40)

async def main():
    """Main entry point for CLI"""
    parser = argparse.ArgumentParser(description="Blog Writing Agent")
    parser.add_argument("topic", help="Blog topic")
    parser.add_argument("--tone", choices=["educational", "formal", "creative", "technical"],
                      default="educational", help="Writing tone")
    parser.add_argument("--api-key", help="Gemini API key (optional)")
    
    args = parser.parse_args()
    
    if args.api_key:
        CONFIG["gemini_api_key"] = args.api_key
        genai.configure(api_key=args.api_key)
        global model
        model = genai.GenerativeModel('gemini-1.5-flash')
    
    async with BlogAgent(args.topic, args.tone) as agent:
        research_data = await agent.research_topic()
        await agent.generate_content(research_data)
        await agent.optimize_seo()
        await agent.export_blog()
        agent.display_summary()

if __name__ == "__main__":
    asyncio.run(main())