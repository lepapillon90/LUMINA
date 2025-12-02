import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
    title: 'Common/SearchBar',
    component: SearchBar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        onSearch: { action: 'searched' },
    },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
    render: (args) => {
        const [lastSearch, setLastSearch] = useState('');

        const handleSearch = (query: string) => {
            setLastSearch(query);
            args.onSearch(query);
        }

        return (
            <div className="w-[500px]">
                <SearchBar {...args} onSearch={handleSearch} />
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Current Search: <span className="font-bold text-black">{lastSearch || '(none)'}</span>
                </div>
            </div>
        );
    },
    args: {
        placeholder: 'Search for products...',
        suggestions: ['Dress', 'Shoes', 'Bag', 'Accessories', 'Summer Collection'],
    },
};

export const WithSuggestions: Story = {
    ...Default,
    args: {
        ...Default.args,
        placeholder: 'Try typing "Dress"...',
        suggestions: ['Summer Dress', 'Maxi Dress', 'Mini Dress', 'Party Dress', 'Casual Dress'],
    }
};
