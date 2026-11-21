import { projects } from '../../content/projects'
import type { SkillGroup } from '../../content/types'
import styles from './SkillsGrid.module.css'

const projectTitles = new Map(projects.map((project) => [project.slug, project.title]))

interface SkillsGridProps {
  groups: SkillGroup[]
}

export function SkillsGrid({ groups }: SkillsGridProps) {
  return (
    <ul role="list" className={styles.grid}>
      {groups.map((group) => (
        <li key={group.title} className={styles.group}>
          <h3 className={styles.title}>{group.title}</h3>
          <ul role="list" className={styles.items}>
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.usedIn}>
            <span className={styles.usedInLabel}>Used in</span>
            {group.projects.map((slug, index) => (
              <span key={slug}>
                {index > 0 && ', '}
                <a href={`#project-${slug}`}>{projectTitles.get(slug) ?? slug}</a>
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  )
}
