import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getHomepageContent, getMediaAssets } from '../../lib/site-content';
import VisualEditor from './visual-editor';

export const metadata: Metadata = { title: 'Visual Site Editor | Elx Operations' };
export default async function EditorPage() { await requireStaff(); const [content, media] = await Promise.all([getHomepageContent(), getMediaAssets()]); return <VisualEditor initialContent={content} media={media} />; }
