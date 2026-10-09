import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CornerDownLeft, Search } from 'lucide-react';
import { GROUPS, useCommands, type Command } from '@/data/commands';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useRecentCommands } from '@/hooks/useRecentCommands';
import { useScrollLock } from '@/hooks/useScrollLock';
import { scoreCommand } from '@/lib/fuzzy';
import { duration, easeOutExpo } from '@/lib/motion/easings';

const LIST_ID = 'palette-list';

/** Command ids contain `:`, which is legal in an id and fine for getElementById. */
const optionId = (id: string) => `palette-opt-${id}`;

/** Below this, a prefix match is too loose to be a deliberate request. */
const SECRET_MIN_QUERY = 3;

type ResultGroup = { label: string; items: Command[] };

/**
 * ⌘K. The signature interaction, built last so it can index everything.
 *
 * **Hand-rolled rather than `cmdk`, which is a deviation from the plan.** The
 * reasoning is in `stage.md`: cmdk's entry pulls in `@radix-ui/react-dialog`
 * and its transitive tree for a fuzzy scorer and a keydown handler, and the
 * overlay, focus trap and scroll lock already exist here from Stage 4. What
 * cmdk would really have bought is a correct combobox, so that part is
 * implemented to the ARIA 1.2 pattern rather than approximated:
 *
 * - focus **never leaves the input**. The arrow keys move
 *   `aria-activedescendant`, not focus, which is what lets someone keep
 *   typing while the selection moves.
 * - the input is the `combobox` with `aria-controls` pointing at the
 *   `listbox`; each row is an `option` with `aria-selected`.
 * - rows are deliberately **not** focusable. A focusable option inside a
 *   combobox is the single most common way this pattern is got wrong.
 *
 * Selection is tracked by **command id, not list index**. The toggles keep the
 * palette open and change their own label, and running one also promotes it
 * into `Recent` — so the list reorders underneath the selection. An index
 * would quietly point at a different command afterwards.
 */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const commands = useCommands();
  const { recent, remember } = useRecentCommands();

  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  useScrollLock(true);
  // Also hands focus back to whatever opened the palette, on unmount — which
  // is this stage's acceptance criterion.
  useFocusTrap(true, panelRef);

  const groups = useMemo<ResultGroup[]>(() => {
    const trimmed = query.trim();

    if (trimmed === '') {
      const byId = new Map(commands.map((command) => [command.id, command]));
      const recentItems = recent
        .map((id) => byId.get(id))
        .filter((command): command is Command => command !== undefined && !command.secret);
      const recentIds = new Set(recentItems.map((command) => command.id));

      const result: ResultGroup[] = [];
      if (recentItems.length > 0) result.push({ label: 'Recent', items: recentItems });

      for (const group of GROUPS) {
        if (group === 'Recent') continue;
        const items = commands.filter(
          (command) => command.group === group && !command.secret && !recentIds.has(command.id),
        );
        if (items.length > 0) result.push({ label: group, items });
      }
      return result;
    }

    const lower = trimmed.toLowerCase();
    const items = commands
      .filter(
        (command) =>
          !command.secret ||
          (lower.length >= SECRET_MIN_QUERY && command.label.toLowerCase().startsWith(lower)),
      )
      .map((command) => ({
        command,
        rank: scoreCommand(command.label, command.keywords, trimmed),
      }))
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map((entry) => entry.command);

    return items.length > 0 ? [{ label: 'Results', items }] : [];
  }, [query, commands, recent]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  /**
   * Joined ids rather than the array: `flat` is a fresh array on every render,
   * so depending on it directly would re-run this on every keystroke of
   * anything. The string only changes when the result set actually does.
   */
  const flatIds = flat.map((command) => command.id).join(',');

  useEffect(() => {
    const ids = flatIds === '' ? [] : flatIds.split(',');
    setActiveId((previous) =>
      previous !== null && ids.includes(previous) ? previous : (ids[0] ?? null),
    );
  }, [flatIds]);

  useEffect(() => {
    if (activeId === null) return;
    // `nearest` keeps the list still when the selection is already visible.
    document.getElementById(optionId(activeId))?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const execute = useCallback(
    (command: Command | undefined) => {
      if (!command) return;
      // Recorded before running: a command may navigate away, and the write
      // is synchronous so it survives that.
      remember(command.id);
      command.run();
      if (!command.keepOpen) onClose();
    },
    [onClose, remember],
  );

  const move = useCallback(
    (delta: number) => {
      if (flat.length === 0) return;
      const current = flat.findIndex((command) => command.id === activeId);
      const base = current === -1 ? 0 : current;
      const next = (base + delta + flat.length) % flat.length;
      setActiveId(flat[next].id);
    },
    [activeId, flat],
  );

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (flat.length > 0) setActiveId(flat[0].id);
        break;
      case 'End':
        event.preventDefault();
        if (flat.length > 0) setActiveId(flat[flat.length - 1].id);
        break;
      case 'Enter':
        event.preventDefault();
        execute(flat.find((command) => command.id === activeId));
        break;
      default:
        break;
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center p-4 pt-[14vh] sm:p-6 sm:pt-[12vh]"
      style={{ zIndex: 'var(--z-palette)' }}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.fast }}
        onClick={onClose}
        className="absolute inset-0"
        style={{
          backgroundColor: 'oklch(0.105 0.012 265 / 0.78)',
          backdropFilter: 'blur(var(--blur-veil))',
        }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.99, transition: { duration: duration.instant } }}
        transition={{ duration: duration.base, ease: easeOutExpo }}
        className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-hairline-strong bg-obsidian-900/95 shadow-elev-3 backdrop-blur-[var(--blur-pane)]"
      >
        {/* ------------------------------------------------------- input */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5">
          <Search aria-hidden size={15} className="shrink-0 text-mint-600" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={activeId ? optionId(activeId) : undefined}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
            placeholder="Type a command or search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-obsidian-500"
          />
          <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-[0.1em] text-obsidian-500 uppercase sm:block">
            esc
          </kbd>
        </div>

        {/* -------------------------------------------------------- list */}
        <div
          id={LIST_ID}
          role="listbox"
          aria-label="Commands"
          className="max-h-[min(24rem,52svh)] overflow-y-auto overscroll-contain p-2"
        >
          {flat.length === 0 ? (
            <p className="px-3 py-8 text-center font-mono text-[0.6875rem] tracking-[0.12em] text-obsidian-500 uppercase">
              No matching command
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} role="group" aria-labelledby={`${LIST_ID}-${group.label}`}>
                <div
                  id={`${LIST_ID}-${group.label}`}
                  role="presentation"
                  className="px-3 pt-3 pb-1.5 font-mono text-[0.5rem] tracking-[0.24em] text-obsidian-600 uppercase"
                >
                  {group.label}
                </div>

                {group.items.map((command) => {
                  const isActive = command.id === activeId;
                  const Icon = command.icon;

                  return (
                    // Not a <button>: in a combobox, focus stays in the input
                    // and selection is conveyed by aria-activedescendant. A
                    // focusable option would break that contract — so this
                    // row is a click target only, and the keyboard path is
                    // the arrow keys above.
                    <div
                      key={command.id}
                      id={optionId(command.id)}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => execute(command)}
                      onMouseMove={() => setActiveId(command.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-100 ${
                        isActive ? 'bg-mint-950/70' : ''
                      }`}
                    >
                      <Icon
                        aria-hidden
                        size={14}
                        className={`shrink-0 ${isActive ? 'text-mint-300' : 'text-obsidian-500'}`}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate font-mono text-[0.8125rem] ${
                          isActive ? 'text-mint-100' : 'text-ink-muted'
                        }`}
                      >
                        {command.label}
                      </span>
                      {command.hint && (
                        <span className="hidden shrink-0 truncate font-mono text-[0.625rem] tracking-[0.1em] text-obsidian-600 uppercase sm:block sm:max-w-[12rem]">
                          {command.hint}
                        </span>
                      )}
                      {isActive && (
                        <CornerDownLeft aria-hidden size={12} className="shrink-0 text-mint-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ------------------------------------------------------ footer */}
        <div
          aria-hidden
          className="flex items-center gap-4 border-t border-hairline px-4 py-2.5 font-mono text-[0.5rem] tracking-[0.18em] text-obsidian-600 uppercase"
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
