// src/lib/blog-service.ts
interface BlogMetadata {
    title: string;
    description: string;
    tags: string[];
    readingTime: string;
    slug: string;
  }
  
  interface Blog {
    content: string;
    metadata: BlogMetadata;
  }
  const simulateProgress = (duration: number) => {
    return new Promise((resolve) => setTimeout(resolve, duration * 100));
  };
export async function writeBlog(topic: string, tone: string = "educational",setProgress:React.Dispatch<React.SetStateAction<{
    stage: string;
    percent: number;
}>>): Promise<Blog> {
    try {
      const responsePromise = fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, tone }),
      });

      const progressUpdates = async () => {
        setProgress({ stage: "Preparing resources", percent: 5 });
        await simulateProgress(10);
        setProgress({ stage: "Researching topic", percent: 15 });
        await simulateProgress(20);
        setProgress({ stage: "Planning content structure", percent: 35 });
        await simulateProgress(15);
        setProgress({ stage: "Generating content", percent: 50 });
        await simulateProgress(30);
        setProgress({ stage: "Optimizing SEO", percent: 80 });
        await simulateProgress(15);
        setProgress({ stage: "Finalizing blog", percent: 90 });
        await simulateProgress(10);
        setProgress({ stage: "Blog completed!", percent: 100 });
      };

      const [response] = await Promise.all([
        responsePromise,
        progressUpdates()
      ]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      return {
        content: data.content,
        metadata: {
          title: data.metadata.title,
          description: data.metadata.description,
          tags: data.metadata.tags || data.metadata.keywords || [],
          readingTime: data.metadata.reading_time || `${Math.ceil(data.content.split(' ').length / 200)} min read`,
          slug: data.metadata.slug || generateSlug(data.metadata.title),
        }
      };
    } catch (error) {
      console.error('Error generating blog:', error);
      throw error;
    }
  }
  
  function generateSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }