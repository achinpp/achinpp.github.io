import type { ProjectStatus } from '@/data/projects';
import type { TagTone } from '@/components/ui/Tag';

/**
 * The colour of a status badge, in one place so a status cannot read one way
 * on the card and another on the briefing it opens.
 *
 * Its own module rather than an export from `ProjectCard`, because a file
 * that exports anything but components loses fast refresh for the components
 * in it, and that card is the thing most often being looked at while this
 * page is worked on.
 *
 * `CLASSIFIED` is `breach`, which is red. It started as `neutral`, on the
 * argument that a badge saying there is nothing to read should not be the
 * loudest thing in the card; you asked for it red, and red is the better
 * answer. The stamp under it is red, so a grey badge over a red plate was two
 * registers in one card. `breach` is otherwise reserved for danger, and this
 * is the one exception, which is noted on the tone itself in `Tag.tsx`.
 *
 * `COMPLETE` is `accent`, with the two other finished states. A finished
 * thing is a good outcome and should read as one.
 */
export const STATUS_TONE: Record<ProjectStatus, TagTone> = {
  ACTIVE: 'signal',
  COMPLETE: 'accent',
  DEPLOYED: 'accent',
  DELIVERED: 'accent',
  ARCHIVED: 'neutral',
  CLASSIFIED: 'breach',
};
