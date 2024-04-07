import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import getProjects, { getProject } from '@/lib/get-projects';
import { CustomMDX } from '@/components/mdx';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

import { Calendar } from 'lucide-react';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata | undefined> {
  getProjects();
  const project = await getProject(params.id);

  if (!project) {
    return {};
  }

  let { title, publishedAt: publishedTime, summary: description, image } = project.metadata;

  let ogImage = image ? `https://patelvivek.dev${image}` : `https://patelvivek.dev/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://patelvivek.dev/projects/${project.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Project({ params }: { params: any }) {
  const project = await getProject(params.id);

  if (!project) {
    return notFound();
  }
  return (
    <div className='mx-auto mt-40 w-4/5'>
      <section>
        <h1 className='title text-2xl font-medium tracking-tighter'>{project.metadata.title}</h1>
        <div className='mb-8 mt-2 flex items-center justify-between text-sm'>
          <Suspense fallback={<Skeleton className='h-4 w-12 rounded-full bg-slate-300 dark:bg-slate-100' />}>
            <p className='text-sm text-neutral-600 dark:text-neutral-400'>
              <span className='flex flex-row items-center gap-2'>
                <Calendar /> {formatDate(project.metadata.publishedAt)}
              </span>
            </p>
          </Suspense>
        </div>
        <hr />
        <article className='prose prose-zinc mx-auto my-10 max-w-none dark:prose-invert md:prose-lg lg:prose-xl prose-a:text-blue-500 prose-a:no-underline'>
          <Suspense fallback={<Skeleton className='h-4 w-12 rounded-full bg-slate-300 dark:bg-slate-100' />}>
            <CustomMDX>{project.content}</CustomMDX>
          </Suspense>
        </article>
      </section>
    </div>
  );
}
