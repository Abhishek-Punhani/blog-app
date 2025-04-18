import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

interface BlogContentProps {
    content: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
    const [title, ...body] = content.split('\n'); 
    const bodyContent = body.join('\n'); 

    return (
        <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="prose prose-blue dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-4">{title}</h1> 
                <ReactMarkdown>{bodyContent}</ReactMarkdown> 
            </div>
        </Card>
    );
};

export default BlogContent;
