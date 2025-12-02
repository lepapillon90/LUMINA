import React from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramFeed: React.FC = () => {
    // Mock Data for Instagram Posts
    const posts = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400",
            likes: 1240,
            comments: 45,
            link: "https://instagram.com"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400",
            likes: 856,
            comments: 23,
            link: "https://instagram.com"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400",
            likes: 2100,
            comments: 112,
            link: "https://instagram.com"
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400",
            likes: 945,
            comments: 38,
            link: "https://instagram.com"
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400",
            likes: 1530,
            comments: 67,
            link: "https://instagram.com"
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=400",
            likes: 1890,
            comments: 92,
            link: "https://instagram.com"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <div className="mb-10">
                    <div className="flex items-center justify-center gap-2 mb-2 text-primary">
                        <Instagram size={24} />
                        <h2 className="text-2xl font-serif">@lumina_official</h2>
                    </div>
                    <p className="text-gray-500 mb-6">Share your moments with #LuminaStyle</p>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium border-b border-black pb-1 hover:text-gray-600 transition"
                    >
                        FOLLOW US <ExternalLink size={14} />
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group aspect-square overflow-hidden bg-gray-100 block"
                        >
                            <img
                                src={post.image}
                                alt={`Instagram post ${post.id}`}
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white gap-2">
                                <div className="flex items-center gap-1">
                                    <Heart size={16} fill="white" />
                                    <span className="text-sm font-bold">{post.likes.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={16} fill="white" />
                                    <span className="text-sm font-bold">{post.comments.toLocaleString()}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
