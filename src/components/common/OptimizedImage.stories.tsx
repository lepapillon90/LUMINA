import type { Meta, StoryObj } from '@storybook/react';
import OptimizedImage from './OptimizedImage';

const meta: Meta<typeof OptimizedImage> = {
    title: 'Common/OptimizedImage',
    component: OptimizedImage,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        src: { control: 'text' },
        alt: { control: 'text' },
        className: { control: 'text' },
        loading: { control: 'select', options: ['lazy', 'eager'] },
    },
};

export default meta;
type Story = StoryObj<typeof OptimizedImage>;

export const Default: Story = {
    args: {
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop',
        alt: 'Smart Watch',
        className: 'w-64 h-64 rounded-lg shadow-lg',
    },
};

export const ErrorState: Story = {
    args: {
        src: 'https://invalid-url.com/image.jpg',
        alt: 'Broken Image',
        className: 'w-64 h-64 rounded-lg shadow-lg bg-gray-200',
    },
};

export const LoadingState: Story = {
    render: (args) => (
        <div className="w-64 h-64">
            {/* We can't easily force loading state without network throttling, 
                but we can show the component structure */}
            <OptimizedImage {...args} />
        </div>
    ),
    args: {
        src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
        alt: 'Headphones',
        className: 'w-full h-full rounded-lg',
    }
}
