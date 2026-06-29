import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getMediaAssets } from '../../lib/site-content';
import MediaLibrary from './media-library';

export const metadata: Metadata = { title: 'Media Library | Elx Operations' };
export default async function MediaPage() { await requireStaff(); return <MediaLibrary initialAssets={await getMediaAssets()} />; }
