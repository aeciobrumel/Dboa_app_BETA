import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { useCardsStore, type Card } from '@app/state/useCardsStore';
import type { CardsStackParamList } from '@app/navigation/CardsNavigator';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore, type SettingsPreferences } from '@app/state/useSettingsStore';
import { speak } from '@app/utils/speak';

const bodyFamily = Platform.select({
  web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontBody = { fontFamily: bodyFamily };
const fontTitle = { fontFamily: tokens.typography.weights.bold };

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized;
  const parsed = Number.parseInt(expanded, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SCREEN_BG = tokens.colors.bg;
const CARD_BORDER = hexToRgba(tokens.colors.text, 0.07);
const HEADER_BORDER = hexToRgba(tokens.colors.text, 0.08);
const TEXT_PRIMARY = tokens.colors.text;
const TEXT_SECONDARY = tokens.colors.textMuted;
const DRAG_HANDLE = hexToRgba(tokens.colors.secondary, 0.75);
const FAB_BG = tokens.colors.primary;
const OVERLAY_BORDER = hexToRgba(tokens.colors.primary, 0.4);

type BreathListItem = {
  id: '__breath__';
  type: 'breath';
};

type CardsListItem = Card | BreathListItem;

type CategoryTone = {
  label: 'Respiração' | 'Segurança' | 'Resiliência' | 'Memória' | 'Presença';
  bg: string;
  stroke: string;
  icon: 'timer' | 'shield' | 'arrow' | 'star' | 'sun';
};

type CardPresentation = {
  title: string;
  description: string;
  playText: string;
  category: CategoryTone;
};

type CardItemProps = {
  presentation: CardPresentation;
  onPress: () => void;
  onPlay: () => void;
  onToggleFavorite?: () => void | Promise<void>;
  onNativeDrag?: () => void;
  isGhost?: boolean;
  isOverlay?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  webSetNodeRef?: ((node: unknown) => void) | undefined;
  webTransform?: string | null;
  webTransition?: string;
  webDragAttributes?: Record<string, unknown>;
  webDragListeners?: Record<string, unknown>;
};

const categoryTones: Record<CategoryTone['label'], CategoryTone> = {
  Respiração: {
    label: 'Respiração',
    bg: hexToRgba(tokens.colors.secondary, 0.22),
    stroke: tokens.colors.primary,
    icon: 'timer',
  },
  Segurança: {
    label: 'Segurança',
    bg: hexToRgba(tokens.colors.accent, 0.58),
    stroke: tokens.colors.primary,
    icon: 'shield',
  },
  Resiliência: {
    label: 'Resiliência',
    bg: hexToRgba(tokens.colors.surface, 0.96),
    stroke: tokens.colors.primary,
    icon: 'arrow',
  },
  Memória: {
    label: 'Memória',
    bg: hexToRgba(tokens.colors.tertiary, 0.26),
    stroke: tokens.colors.primary,
    icon: 'star',
  },
  Presença: {
    label: 'Presença',
    bg: hexToRgba(tokens.colors.secondary, 0.14),
    stroke: tokens.colors.primary,
    icon: 'sun',
  },
};

function GripVerticalIcon({ color = DRAG_HANDLE }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Circle cx="9" cy="6" r="1.4" fill={color} />
      <Circle cx="15" cy="6" r="1.4" fill={color} />
      <Circle cx="9" cy="12" r="1.4" fill={color} />
      <Circle cx="15" cy="12" r="1.4" fill={color} />
      <Circle cx="9" cy="18" r="1.4" fill={color} />
      <Circle cx="15" cy="18" r="1.4" fill={color} />
    </Svg>
  );
}

function TimerIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Circle cx="12" cy="13" r="7" stroke={color} strokeWidth={1.8} />
      <Line
        x1="12"
        y1="2.5"
        x2="12"
        y2="5.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="9"
        y1="2.5"
        x2="15"
        y2="2.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="13"
        x2="15.5"
        y2="10.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M12 3L5.5 5.7V11.8C5.5 16.1 8.2 20.1 12 21.5C15.8 20.1 18.5 16.1 18.5 11.8V5.7L12 3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M9.3 12.1L11.2 14L14.9 10.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRightIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Polyline
        points="12,5 19,12 12,19"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M12 3.7L14.3 8.4L19.4 9.2L15.7 12.9L16.6 18L12 15.6L7.4 18L8.3 12.9L4.6 9.2L9.7 8.4L12 3.7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.8} />
      <Line
        x1="12"
        y1="2.5"
        x2="12"
        y2="5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="19"
        x2="12"
        y2="21.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="2.5"
        y1="12"
        x2="5"
        y2="12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="19"
        y1="12"
        x2="21.5"
        y2="12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="5.4"
        y1="5.4"
        x2="7.2"
        y2="7.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="16.8"
        y1="16.8"
        x2="18.6"
        y2="18.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="16.8"
        y1="7.2"
        x2="18.6"
        y2="5.4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="5.4"
        y1="18.6"
        x2="7.2"
        y2="16.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none" accessibilityElementsHidden>
      <Path d="M3 2.1L9.1 6L3 9.9V2.1Z" fill="#FFFFFF" />
    </Svg>
  );
}

function CategoryIcon({ tone }: { tone: CategoryTone }) {
  switch (tone.icon) {
    case 'timer':
      return <TimerIcon color={tone.stroke} />;
    case 'shield':
      return <ShieldCheckIcon color={tone.stroke} />;
    case 'arrow':
      return <ArrowRightIcon color={tone.stroke} />;
    case 'star':
      return <StarIcon color={tone.stroke} />;
    case 'sun':
      return <SunIcon color={tone.stroke} />;
    default:
      return <TimerIcon color={tone.stroke} />;
  }
}

function isBreathItem(item: CardsListItem): item is BreathListItem {
  return 'type' in item && item.type === 'breath';
}

function inferCategoryTone(item: CardsListItem): CategoryTone {
  if (isBreathItem(item)) return categoryTones.Respiração;

  const normalized = `${item.title} ${item.body}`
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  if (
    normalized.includes('respir') ||
    normalized.includes('inspire') ||
    normalized.includes('expire') ||
    normalized.includes('ar ')
  ) {
    return categoryTones.Respiração;
  }

  if (
    normalized.includes('segur') ||
    normalized.includes('proteg') ||
    normalized.includes('calma')
  ) {
    return categoryTones.Segurança;
  }

  if (
    normalized.includes('lemb') ||
    normalized.includes('memoria') ||
    normalized.includes('momento')
  ) {
    return categoryTones.Memória;
  }

  if (
    normalized.includes('presente') ||
    normalized.includes('observe') ||
    normalized.includes('ve ') ||
    normalized.includes('toque') ||
    normalized.includes('som') ||
    normalized.includes('cheiro') ||
    normalized.includes('sabor')
  ) {
    return categoryTones.Presença;
  }

  return categoryTones.Resiliência;
}

function getPresentation(item: CardsListItem, breathCycles: number): CardPresentation {
  if (isBreathItem(item)) {
    const title = 'Respiração guiada';
    const description = `Inspire 4s, segure 4s, expire 6s. ${breathCycles} ciclos.`;
    return {
      title,
      description,
      playText: `${title}. ${description}`,
      category: categoryTones.Respiração,
    };
  }

  return {
    title: item.title,
    description: item.body,
    playText: `${item.title}. ${item.body}`,
    category: inferCategoryTone(item),
  };
}

function commitOrder(
  next: CardsListItem[],
  setPreferences: (preferences: Partial<SettingsPreferences>) => void,
  reorder: (cards: Card[]) => Promise<void>,
) {
  const breathIdx = next.findIndex(isBreathItem);
  const cardsOnly = next.filter((item): item is Card => !isBreathItem(item));
  setPreferences({ breathListIndex: Math.max(0, breathIdx) });
  void reorder(cardsOnly);
}

function CardItem({
  presentation,
  onPress,
  onPlay,
  onToggleFavorite,
  onNativeDrag,
  isGhost = false,
  isOverlay = false,
  containerStyle,
  webSetNodeRef,
  webTransform,
  webTransition,
  webDragAttributes,
  webDragListeners,
}: CardItemProps) {
  if (Platform.OS === 'web') {
    return (
      <div
        ref={webSetNodeRef as never}
        className="flex items-center gap-3 rounded-[18px] border border-[rgba(0,0,0,0.07)] bg-white px-4 py-[14px]"
        style={{
          opacity: isGhost ? 0.35 : 1,
          backgroundColor: tokens.colors.bg,
          borderColor: isOverlay ? OVERLAY_BORDER : CARD_BORDER,
          transform: isOverlay ? 'scale(0.97)' : (webTransform ?? undefined),
          transition: webTransition,
        }}
      >
        <button
          type="button"
          aria-label="Arrastar para reordenar"
          className="flex h-4 w-4 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
          style={{ padding: 0, background: 'transparent', border: 'none' }}
          {...(webDragAttributes as object)}
          {...(webDragListeners as object)}
        >
          <GripVerticalIcon />
        </button>

        <button
          type="button"
          onClick={onPress}
          onContextMenu={event => {
            event.preventDefault();
            void onToggleFavorite?.();
          }}
          className="flex min-w-0 flex-1 items-center gap-3 bg-transparent p-0 text-left"
          style={{ border: 'none' }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: presentation.category.bg }}
          >
            <CategoryIcon tone={presentation.category} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="m-0 text-[14px] font-bold tracking-[0.01em]"
              style={{
                color: TEXT_PRIMARY,
                fontFamily: bodyFamily,
                lineHeight: '18px',
              }}
            >
              {presentation.title}
            </p>
            <p
              className="m-0 mt-1 whitespace-pre-line text-[12px] font-normal"
              style={{
                color: TEXT_SECONDARY,
                fontFamily: bodyFamily,
                lineHeight: 1.5,
              }}
            >
              {presentation.description}
            </p>
          </div>
        </button>

        <button
          type="button"
          aria-label="Ouvir cartão"
          onClick={onPlay}
          className="ml-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0"
          style={{ border: 'none', backgroundColor: tokens.colors.primary }}
        >
          <PlayIcon />
        </button>
      </div>
    );
  }

  return (
    <View
      style={[
        styles.card,
        isGhost ? styles.ghostCard : null,
        isOverlay ? styles.overlayCard : null,
        containerStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Arrastar para reordenar"
        onLongPress={onNativeDrag}
        delayLongPress={200}
        style={styles.handleButton}
      >
        <GripVerticalIcon />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={presentation.title}
        onPress={onPress}
        onLongPress={onToggleFavorite}
        style={styles.contentButton}
      >
        <View style={[styles.categoryBadge, { backgroundColor: presentation.category.bg }]}>
          <CategoryIcon tone={presentation.category} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.cardTitle, { fontFamily: bodyFamily }]}>{presentation.title}</Text>
          <Text style={[styles.cardDescription, { fontFamily: bodyFamily }]}>
            {presentation.description}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvir cartão"
        onPress={onPlay}
        style={styles.playButton}
      >
        <PlayIcon />
      </Pressable>
    </View>
  );
}

function WebSortableCard({
  item,
  presentation,
  onPress,
  onPlay,
  onToggleFavorite,
}: {
  item: CardsListItem;
  presentation: CardPresentation;
  onPress: () => void;
  onPlay: () => void;
  onToggleFavorite?: () => void | Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <CardItem
      presentation={presentation}
      onPress={onPress}
      onPlay={onPlay}
      onToggleFavorite={onToggleFavorite}
      isGhost={isDragging}
      webSetNodeRef={setNodeRef as (node: unknown) => void}
      webTransform={CSS.Transform.toString(transform)}
      webTransition={transition}
      webDragAttributes={attributes as unknown as Record<string, unknown>}
      webDragListeners={listeners as Record<string, unknown>}
    />
  );
}

function CardsListWeb({
  data,
  activeId,
  fabBottom,
  onGoHome,
  onAdd,
  onPressItem,
  onPlayItem,
  onToggleFavorite,
  onDragStart,
  onDragCancel,
  onDragEnd,
  breathCycles,
}: {
  data: CardsListItem[];
  activeId: string | null;
  fabBottom: number;
  onGoHome: () => void;
  onAdd: () => void;
  onPressItem: (item: CardsListItem) => void;
  onPlayItem: (item: CardsListItem) => void;
  onToggleFavorite: (item: CardsListItem) => void;
  onDragStart: (id: string) => void;
  onDragCancel: () => void;
  onDragEnd: (activeId: string, overId: string) => void;
  breathCycles: number;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const activeItem = activeId ? (data.find(item => item.id === activeId) ?? null) : null;

  return (
    <div className="flex h-full w-full justify-center" style={{ backgroundColor: SCREEN_BG }}>
      <div
        className="relative flex h-full w-full max-w-[390px] flex-col"
        style={{ backgroundColor: SCREEN_BG }}
      >
        <div
          className="sticky top-0 z-10 flex items-center px-[14px] py-3"
          style={{
            backgroundColor: SCREEN_BG,
            borderBottom: `0.5px solid ${HEADER_BORDER}`,
          }}
        >
          <button
            type="button"
            onClick={onGoHome}
            className="min-w-[68px] bg-transparent p-0 text-left text-[12px]"
            style={{
              border: 'none',
              color: TEXT_SECONDARY,
              fontFamily: bodyFamily,
            }}
            aria-label="Ir para Início"
          >
            ← Início
          </button>
          <h1
            className="m-0 flex-1 text-center text-[18px]"
            style={{
              color: TEXT_PRIMARY,
              fontFamily: tokens.typography.weights.bold,
            }}
          >
            Meus cartões
          </h1>
          <div className="min-w-[68px]" aria-hidden />
        </div>

        <div
          className="flex-1 overflow-y-auto px-[14px] pb-[100px] pt-[14px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => onDragStart(String(active.id))}
            onDragCancel={onDragCancel}
            onDragEnd={({ active, over }) => {
              if (!over) {
                onDragCancel();
                return;
              }
              onDragEnd(String(active.id), String(over.id));
            }}
          >
            <SortableContext
              items={data.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2.5">
                {data.map(item => (
                  <WebSortableCard
                    key={item.id}
                    item={item}
                    presentation={getPresentation(item, breathCycles)}
                    onPress={() => onPressItem(item)}
                    onPlay={() => onPlayItem(item)}
                    onToggleFavorite={() => onToggleFavorite(item)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeItem ? (
                <CardItem
                  presentation={getPresentation(activeItem, breathCycles)}
                  onPress={() => onPressItem(activeItem)}
                  onPlay={() => onPlayItem(activeItem)}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="pointer-events-none absolute inset-x-0" style={{ bottom: fabBottom }}>
          <div className="px-[14px]">
            <button
              type="button"
              onClick={onAdd}
              aria-label="Adicionar cartão"
              className="pointer-events-auto flex w-full items-center justify-center rounded-[14px] py-3.5 text-[12px] uppercase tracking-[0.18em]"
              style={{
                border: 'none',
                backgroundColor: tokens.colors.primary,
                color: tokens.colors.bg,
                fontFamily: tokens.typography.weights.bold,
              }}
            >
              + Adicionar cartão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsListNative({
  data,
  fabBottom,
  onGoHome,
  onAdd,
  onPressItem,
  onPlayItem,
  onToggleFavorite,
  onDragCommit,
  breathCycles,
}: {
  data: CardsListItem[];
  fabBottom: number;
  onGoHome: () => void;
  onAdd: () => void;
  onPressItem: (item: CardsListItem) => void;
  onPlayItem: (item: CardsListItem) => void;
  onToggleFavorite: (item: CardsListItem) => void;
  onDragCommit: (next: CardsListItem[]) => void;
  breathCycles: number;
}) {
  return (
    <View style={styles.nativeScreen}>
      <View style={styles.nativeFrame}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir para Início"
            onPress={onGoHome}
            style={styles.backButton}
          >
            <Text style={[styles.backText, fontBody]}>← Início</Text>
          </Pressable>
          <Text style={[styles.headerTitle, fontTitle]}>Meus cartões</Text>
          <View style={styles.headerSpacer} />
        </View>

        <DraggableFlatList
          data={data}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          activationDistance={8}
          renderItem={({ item, drag, isActive }: RenderItemParams<CardsListItem>) => (
            <CardItem
              presentation={getPresentation(item, breathCycles)}
              onPress={() => onPressItem(item)}
              onPlay={() => onPlayItem(item)}
              onToggleFavorite={() => onToggleFavorite(item)}
              onNativeDrag={drag}
              isGhost={isActive}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onDragEnd={({ data: next }) => onDragCommit(next)}
        />

        <View pointerEvents="box-none" style={[styles.fabWrap, { bottom: fabBottom }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar cartão"
            onPress={onAdd}
            style={styles.fab}
          >
            <Text style={[styles.fabText, fontTitle]}>+ Adicionar cartão</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CardsList() {
  const nav = useNavigation<NativeStackNavigationProp<CardsStackParamList>>();
  const insets = useSafeAreaInsets();
  const { cards, hydrate, toggleFavorite, reorder } = useCardsStore();
  const { breathCycles, breathListIndex, setPreferences } = useSettingsStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const data = useMemo<CardsListItem[]>(() => {
    const breathItem: BreathListItem = { id: '__breath__', type: 'breath' };
    const index = Math.max(0, Math.min(breathListIndex ?? 0, cards.length));
    return [...cards.slice(0, index), breathItem, ...cards.slice(index)];
  }, [breathListIndex, cards]);

  const fabBottom = Math.max(insets.bottom, 18);

  const goHome = () => {
    nav.getParent()?.navigate('Home' as never);
  };

  const openItem = (item: CardsListItem) => {
    if (isBreathItem(item)) {
      nav.navigate('BreathEditor');
      return;
    }
    nav.navigate('CardEditor', { id: item.id });
  };

  const playItem = (item: CardsListItem) => {
    void speak(getPresentation(item, breathCycles).playText);
  };

  const toggleFavoriteIfCard = (item: CardsListItem) => {
    if (isBreathItem(item)) return;
    void toggleFavorite(item.id);
  };

  const handleWebDragEnd = (draggedId: string, overId: string) => {
    setActiveId(null);
    if (draggedId === overId) return;
    const oldIndex = data.findIndex(item => item.id === draggedId);
    const newIndex = data.findIndex(item => item.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    commitOrder(arrayMove(data, oldIndex, newIndex), setPreferences, reorder);
  };

  if (Platform.OS === 'web') {
    return (
      <CardsListWeb
        data={data}
        activeId={activeId}
        fabBottom={fabBottom}
        onGoHome={goHome}
        onAdd={() => nav.navigate('CardEditor')}
        onPressItem={openItem}
        onPlayItem={playItem}
        onToggleFavorite={toggleFavoriteIfCard}
        onDragStart={setActiveId}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleWebDragEnd}
        breathCycles={breathCycles}
      />
    );
  }

  return (
    <CardsListNative
      data={data}
      fabBottom={fabBottom}
      onGoHome={goHome}
      onAdd={() => nav.navigate('CardEditor')}
      onPressItem={openItem}
      onPlayItem={playItem}
      onToggleFavorite={toggleFavoriteIfCard}
      onDragCommit={next => commitOrder(next, setPreferences, reorder)}
      breathCycles={breathCycles}
    />
  );
}

const styles = StyleSheet.create({
  backButton: {
    minWidth: 68,
    paddingVertical: 4,
  },
  backText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: tokens.colors.bg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: CARD_BORDER,
  },
  cardDescription: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
  },
  cardTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.14,
    lineHeight: 18,
    marginBottom: 2,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    marginHorizontal: 14,
    backgroundColor: FAB_BG,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  fabText: {
    color: tokens.colors.bg,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  ghostCard: {
    opacity: 0.35,
  },
  handleButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: SCREEN_BG,
    borderBottomWidth: 0.5,
    borderBottomColor: HEADER_BORDER,
    zIndex: 10,
  },
  headerSpacer: {
    minWidth: 68,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: TEXT_PRIMARY,
    fontSize: 18,
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 100,
  },
  nativeFrame: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  nativeScreen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: SCREEN_BG,
  },
  overlayCard: {
    borderColor: OVERLAY_BORDER,
    transform: [{ scale: 0.97 }],
  },
  playButton: {
    width: 32,
    height: 32,
    marginLeft: 1,
    borderRadius: 999,
    backgroundColor: FAB_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 10,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
});
