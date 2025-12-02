import type { Meta, StoryObj } from '@storybook/react';
import NewsletterPopup from './NewsletterPopup';

const meta: Meta<typeof NewsletterPopup> = {
    title: 'Features/Home/NewsletterPopup',
    component: NewsletterPopup,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NewsletterPopup>;

export const Default: Story = {
    args: {
        forceShow: true,
    },
};
