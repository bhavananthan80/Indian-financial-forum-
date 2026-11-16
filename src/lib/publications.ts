import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { publishedPublication, publishedPublications } from './iff-api.server';

export const listPublications = createServerFn({ method: 'GET' }).handler(() => publishedPublications());

export const getPublication = createServerFn({ method: 'GET' })
  .validator(z.string().max(100))
  .handler(({ data }) => publishedPublication(data));
