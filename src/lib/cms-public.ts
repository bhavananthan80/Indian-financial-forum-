import { createServerFn } from '@tanstack/react-start';
import { publicCms } from './iff-cms.server';

export const loadPublicCms = createServerFn({ method: 'GET' }).handler(publicCms);
