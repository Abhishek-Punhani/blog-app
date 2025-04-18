  import React, { useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { useToast } from '@/contexts/toast/toastContext';
  import BlogContent from '@/components/BlogContent';
  import BlogMetadata from '@/components/BlogMetadata';
  import { writeBlog } from '@/lib/blog-service';
  import { ModeToggle } from '@/components/toggleTheme';

  const Index = () => {
    const toast = useToast();
    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("educational");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ stage: "", percent: 0 });

    interface BlogState {
      content: string;
      metadata: {
        title: string;
        description: string;
        tags: string[];
        readingTime: string;
        slug: string;
      };
    }

    const [blog, setBlog] = useState<BlogState>({
      content: "",
      metadata: {
        title: "",
        description: "",
        tags: [],
        readingTime: "",
        slug: "",
      },
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!topic.trim()) {
        toast.open({
          message: {
            heading: "Missing Information",
            content: "Please enter a topic to generate the blog.",
          },
          duration: 5000,
          position: "top-center",
          color: "warning",
        });
        return;
      }

      setIsLoading(true);
      setBlog({
        content: "",
        metadata: {
          title: "",
          description: "",
          tags: [],
          readingTime: "",
          slug: "",
        },
      });

      try {
        const result = await writeBlog(topic, tone, setProgress);

        setBlog(result);

        toast.open({
          message: {
            heading: "Blog Generated",
            content: `Your blog about "${topic}" has been generated successfully.`,
          },
          duration: 5000,
          position: "top-center",
          color: "success",
        });
      } catch (error) {
        console.error("Error generating blog:", error);
        toast.open({
          message: {
            heading: "Generation Failed",
            content: "There was an error generating your blog. Please try again.",
          },
          duration: 5000,
          position: "top-center",
          color: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const downloadMarkdown = () => {
      if (!blog.content) return;

      const element = document.createElement("a");
      const file = new Blob([blog.content], { type: "text/markdown" });
      element.href = URL.createObjectURL(file);
      element.download = `${blog.metadata.slug || "blog"}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.open({
        message: {
          heading: "Download Started",
          content: "Your markdown file is being downloaded.",
        },
        duration: 5000,
        position: "top-center",
        color: "success",
      });
    };

    const downloadMetadata = () => {
      if (!blog.metadata) return;

      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(blog.metadata, null, 2)], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = `${blog.metadata.slug || "blog"}-metadata.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.open({
        message: {
          heading: "Download Started",
          content: "Your metadata JSON file is being downloaded.",
        },
        duration: 5000,
        position: "top-center",
        color: "success",
      });
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <ModeToggle />
            <h1 className="text-5xl font-extrabold text-white mb-4">AI Blog Writing Agent</h1>
            <p className="text-lg text-blue-100 font-medium">
              Your autonomous content generation assistant
            </p>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-12 px-6">
          <Card className="mb-10 shadow-xl rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                Generate a New Blog
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter a topic and our AI agent will research, write, and optimize a blog post for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Blog Topic
                  </label>
                  <Input
                    id="topic"
                    placeholder="e.g., How Python is used in AI"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="tone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Writing Tone
                  </label>
                  <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                    <SelectTrigger className="w-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !topic.trim()}
                className="bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-100 disabled:bg-blue-700 disabled:text-white px-6 py-2 rounded-lg font-medium"
              >
                {isLoading ? "Generating..." : "Generate Blog"}
              </Button>
            </CardFooter>
          </Card>

          {isLoading && (
            <Card className="mb-10 shadow-xl rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Generating Your Blog
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Our AI agents are working on creating your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{progress.stage}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{progress.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 dark:bg-gray-700">
                    <div
                      className="bg-blue-700 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {blog.content && (
            <Card className="shadow-xl rounded-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  Generated Blog
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your AI-generated blog is ready to review and download.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger
                      value="content"
                      className="text-gray-200 dark:text-gray-200 disabled:opacity-70 disabled:text-gray-800"
                    >
                      Blog Content
                    </TabsTrigger>
                    <TabsTrigger
                      value="metadata"
                      className="text-gray-200 dark:text-gray-200 disabled:opacity-70 disabled:text-gray-800"
                    >
                      SEO Metadata
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="content">
                    <BlogContent content={blog.content} />
                  </TabsContent>
                  <TabsContent value="metadata">
                    <BlogMetadata metadata={blog.metadata} />
                  </TabsContent>
                </Tabs>  </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={downloadMetadata}
                  className="border-gray-400 text-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Download Metadata (JSON)
                </Button>
                <Button
                  onClick={downloadMarkdown}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                >
                  Download Blog (Markdown)
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>

        <footer className="bg-gray-100 border-t border-gray-200 mt-16 py-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-700 dark:text-gray-300">
              AI Blog Writing Agent &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    );
  };

  export default Index;
