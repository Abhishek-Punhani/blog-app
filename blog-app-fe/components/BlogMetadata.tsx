import React from 'react';
import { Badge } from "@/components/ui/badge";

interface BlogMetadataProps {
    metadata: {
        title: string;
        description: string;
        tags: string[];
        readingTime: string;
        slug: string;
    };
}

const BlogMetadata: React.FC<BlogMetadataProps> = ({ metadata }) => {
    return (
        <div className="container mx-auto p-4 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">Title</h3>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                    {metadata.title}
                </p>
            </div>
            
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">Description</h3>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-300">
                    {metadata.description}
                </p>
            </div>
            
            <div className="overflow-hidden">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-2 max-w-full">
                    {metadata.tags.map((tag, index) => (
                        <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-gray-900 border-gray-300 dark:text-gray-300 dark:border-gray-600 px-2 py-1 text-sm rounded-full whitespace-nowrap"
    >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">Reading Time</h3>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-300">
                    {metadata.readingTime}
                </p>
            </div>
            
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">URL Slug</h3>
                <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 dark:text-gray-300 p-1 rounded overflow-x-auto">
                    {metadata.slug}
                </p>
            </div>
        </div>
    );
};

export default BlogMetadata;