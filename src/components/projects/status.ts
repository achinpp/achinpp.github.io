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
 * `CLASSIFIED` is neutral on purpose. `breach` is reserved for danger and a
 * withheld briefing is not one, and the mint of `accent` is the colour this
 * page uses for something it wants read. A badge that says there is nothing
 * to read should not be the loudest thing in the card.
 */
export const STATUS_TONE: Record<ProjectStatus, TagTone> = {
  ACTIVE: 'signal',
  DEPLOYED: 'accent',
  DELIVERED: 'accent',
  ARCHIVED: 'neutral',
  CLASSIFIED: 'neutral',
};
