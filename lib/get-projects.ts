import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { getReadingTime } from './utils';

const PROJECTS_FOLDER = path.join(process.cwd(), 'content', 'projects');

type Metadata = {
  title: string;
  publishedAt: string;
  description: string;
  tags: string[];
  published: boolean;
  image?: string;
};

function getProjectFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

// function readProjectFile(filePath: string) {
//   return fs.readFileSync(filePath, 'utf-8');
// }

export const getProjects = cache(() => {
  const projects = getProjectFiles(PROJECTS_FOLDER);

  return projects.map((file) => {
    const filePath = path.join(PROJECTS_FOLDER, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const readingTime = getReadingTime(content);
    return {
      metadata: data as Partial<Metadata>,
      readingTime: readingTime,
      content,
      slug: file.replace(/\.mdx?$/, ''),
    };
  });
});

export function getProject(slug: string) {
  const projects = getProjects();
  const project = projects.find((post) => post.slug === slug);
  return project;
}

export function getLatestProjects() {
  let projects = getProjects();

  projects = projects.slice(0, 4);

  // Sort projects by publishedAt in descending order - publishedAt: 'May 04, 2024'
  return projects.sort((a, b) => {
    const aDate = new Date(a.metadata.publishedAt!);
    const bDate = new Date(b.metadata.publishedAt!);
    return bDate.getTime() - aDate.getTime();
  });
}

export function getAllProjectsTags() {
  let projects = getProjects();
  projects = projects.filter(
    (project) => project.metadata && project.metadata.published === true,
  );
  const tags: Record<string, number> = {};
  projects.forEach((project) => {
    project.metadata.tags!.forEach((tag) => {
      tag = tag.trim();
      tag = tag.toLowerCase();
      if (!tags[tag]) {
        tags[tag] = 0;
      }
      tags[tag]++;
    });
  });

  return tags;
}

export function getProjectsByTag(tag: string) {
  let projects = getProjects();
  projects = projects.filter(
    (project) => project.metadata && project.metadata.published === true,
  );
  const filteredProjects = projects.filter(
    (project) =>
      project.metadata.tags!.filter(
        (t) => t.toLowerCase() === tag.toLowerCase(),
      ).length > 0,
  );
  return filteredProjects;
}
