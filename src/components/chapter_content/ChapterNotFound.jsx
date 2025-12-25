import Link from "next/link";

const ChapterNotFound = ({ roadmapId }) => {
    return (
        <div className="min-h-screen bg-background p-6 flex items-center justify-center">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">Chapter Content Not Available</h2>
                <p className="mb-6 text-muted-foreground">
                    This chapter hasn't been generated yet. Content for published courses will be generated when you first access them.
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                    Please return to the roadmap and try again, or contact support if the issue persists.
                </p>
                <Link
                    href={`/roadmap/${roadmapId}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Return to Roadmap
                </Link>
            </div>
        </div>
    );
};

export default ChapterNotFound;
