import { Fragment, type CSSProperties } from 'react'
import styles from './KineticName.module.css'

interface KineticNameProps {
  name: string
  id?: string
  className?: string
}

/**
 * The hero name, split into letters so each one can react to the pointer:
 * the hovered letter and its neighbours shift weight in the variable font.
 * Screen readers get the plain name; the letter spans are hidden from them.
 */
export function KineticName({ name, id, className }: KineticNameProps) {
  const words = name.split(' ')
  let letterIndex = 0
  return (
    <h1 id={id} className={`${styles.name} ${className ?? ''}`}>
      <span className="visually-hidden">{name}</span>
      <span aria-hidden="true" className={styles.letters}>
        {words.map((word, wordIndex) => (
          // The space sits between word spans so the name can wrap between words.
          <Fragment key={`${word}-${wordIndex}`}>
            {wordIndex > 0 && ' '}
            <span className={styles.word}>
              {[...word].map((letter) => {
                const index = letterIndex++
                return (
                  <span key={index} className={styles.letter} style={{ '--i': index } as CSSProperties}>
                    {letter}
                  </span>
                )
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </h1>
  )
}
