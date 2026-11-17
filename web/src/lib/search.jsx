import { topicLabel } from '../data/courses.js'

// Lower case and without accents, so "Lötte" finds "lotte" and "e-mail" finds "email".
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-_/]/g, ' ')
}

// Every word of the query has to appear somewhere in the course.
// Hits in the title count most, then lesson titles, then the rest.
// Returns null when the course does not match, otherwise { score, lesson }.
export function matchCourse(course, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return { score: 0, lesson: null }

  const title = normalize(course.title)
  const rest = normalize([course.summary, course.teacher, course.level, topicLabel(course.topic), ...course.outcomes].join(' '))
  const lessons = course.lessons.map((l) => normalize(l.title))

  let score = 0
  let lesson = null
  for (const word of words) {
    const inTitle = title.includes(word)
    const lessonIndex = lessons.findIndex((l) => l.includes(word))
    const inRest = rest.includes(word)
    if (!inTitle && lessonIndex < 0 && !inRest) return null
    if (inTitle) score += title.startsWith(word) ? 4 : 3
    if (lessonIndex >= 0) {
      score += 2
      if (!inTitle && !lesson) lesson = course.lessons[lessonIndex]
    }
    if (inRest) score += 1
  }
  return { score, lesson }
}

// Wraps the parts of `text` that match the query in <mark>.
export function highlight(text, query) {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1)
  if (words.length === 0) return text
  const plain = normalize(text)
  const marks = new Array(text.length).fill(false)
  for (const word of words) {
    let from = plain.indexOf(word)
    while (from >= 0) {
      for (let i = from; i < from + word.length; i += 1) marks[i] = true
      from = plain.indexOf(word, from + word.length)
    }
  }
  const parts = []
  let start = 0
  for (let i = 1; i <= text.length; i += 1) {
    if (i === text.length || marks[i] !== marks[start]) {
      const piece = text.slice(start, i)
      parts.push(marks[start] ? <mark key={start}>{piece}</mark> : piece)
      start = i
    }
  }
  return parts
}
