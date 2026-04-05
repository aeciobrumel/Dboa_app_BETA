import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import type { CardsStackParamList } from '@app/navigation/CardsNavigator';
import { useCardsStore, type Card } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import { speak } from '@app/utils/speak';

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 2000;

type FormValues = {
  title: string;
  body: string;
};

type CategoryLabel = 'Respiração' | 'Segurança' | 'Resiliência' | 'Memória' | 'Presença';

type CategoryTone = {
  label: CategoryLabel;
  bg: string;
  stroke: string;
  icon: 'timer' | 'shield' | 'arrow' | 'star' | 'sun';
};

type ButtonVariant = 'secondary' | 'destructive';

const bodyFamily = Platform.select({
  web: 'system-ui, sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontBody = { fontFamily: bodyFamily };
const fontTitle = { fontFamily: tokens.typography.weights.bold };
const trackingWide = { fontFamily: bodyFamily, letterSpacing: 0.7 };
const trackingWidest = { fontFamily: bodyFamily, letterSpacing: 1.3 };

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

const categoryTones: Record<CategoryLabel, CategoryTone> = {
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

function ChevronLeftIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Polyline
        points="15,6 9,12 15,18"
        stroke={tokens.colors.text}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TimerIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
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

function ShieldCheckIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
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

function ArrowRightIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
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

function StarIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M12 3.7L14.3 8.4L19.4 9.2L15.7 12.9L16.6 18L12 15.6L7.4 18L8.3 12.9L4.6 9.2L9.7 8.4L12 3.7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SunIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
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

function ImagePlusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <RectPath />
      <Path
        d="M8 15L10.8 12.2C11.2 11.8 11.8 11.8 12.2 12.2L16 16"
        stroke={tokens.colors.textMuted}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="15.5" cy="8.5" r="1.2" fill={tokens.colors.textMuted} />
      <Line
        x1="12"
        y1="5.8"
        x2="12"
        y2="10.2"
        stroke={tokens.colors.textMuted}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Line
        x1="9.8"
        y1="8"
        x2="14.2"
        y2="8"
        stroke={tokens.colors.textMuted}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function RectPath() {
  return (
    <RectPathBase
      d="M5.5 5.5H18.5V18.5H5.5V5.5Z"
      stroke={tokens.colors.textMuted}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  );
}

function RectPathBase(props: React.ComponentProps<typeof Path>) {
  return <Path {...props} fill="none" />;
}

function PlayIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none" accessibilityElementsHidden>
      <Path d="M3 2.1L9.1 6L3 9.9V2.1Z" fill={tokens.colors.bg} />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        stroke={tokens.colors.bg}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
        stroke={tokens.colors.bg}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CategoryIcon({ tone, size = 14 }: { tone: CategoryTone; size?: number }) {
  switch (tone.icon) {
    case 'timer':
      return <TimerIcon color={tone.stroke} size={size} />;
    case 'shield':
      return <ShieldCheckIcon color={tone.stroke} size={size} />;
    case 'arrow':
      return <ArrowRightIcon color={tone.stroke} size={size} />;
    case 'star':
      return <StarIcon color={tone.stroke} size={size} />;
    case 'sun':
      return <SunIcon color={tone.stroke} size={size} />;
    default:
      return <TimerIcon color={tone.stroke} size={size} />;
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={[styles.fieldLabel, trackingWide]}>{children}</Text>;
}

function SecondaryButton({
  label,
  onPress,
  variant = 'secondary',
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        variant === 'destructive' ? styles.secondaryButtonDestructive : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          trackingWide,
          fontBody,
          variant === 'destructive' ? styles.secondaryButtonTextDestructive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreviewCard({
  title,
  body,
  category,
}: {
  title: string;
  body: string;
  category: CategoryTone;
}) {
  return (
    <View style={styles.previewCard}>
      <View style={[styles.previewBadge, { backgroundColor: category.bg }]}>
        <CategoryIcon tone={category} size={18} />
      </View>

      <View style={styles.previewTextBlock}>
        <Text style={[styles.previewTitle, fontBody]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.previewDescription, fontBody]} numberOfLines={3}>
          {body}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvir cartão"
        style={styles.previewPlay}
      >
        <PlayIcon />
      </Pressable>
    </View>
  );
}

export default function CardEditor() {
  const { t } = useTranslation('cards');
  const nav = useNavigation<NativeStackNavigationProp<CardsStackParamList>>();
  const route = useRoute<RouteProp<CardsStackParamList, 'CardEditor'>>();
  const id = route.params?.id;
  const { cards, addCard, updateCard, removeCard } = useCardsStore();
  const current = cards.find(card => card.id === id);
  const [category, setCategory] = useState<CategoryLabel>('Respiração');
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    current?.imageBase64 ? `data:image/jpeg;base64,${current.imageBase64}` : current?.imageUri,
  );
  const [imagePayload, setImagePayload] = useState<{ uri?: string; base64?: string } | undefined>(
    current?.imageBase64 || current?.imageUri
      ? { uri: current?.imageUri, base64: current?.imageBase64 }
      : undefined,
  );

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { title: '', body: '' },
  });

  const live = useWatch({ control });

  useEffect(() => {
    if (!current) return;

    setValue('title', current.title);
    setValue('body', current.body);
    setImagePreview(
      current.imageBase64 ? `data:image/jpeg;base64,${current.imageBase64}` : current.imageUri,
    );
    setImagePayload(
      current.imageBase64 || current.imageUri
        ? { uri: current.imageUri, base64: current.imageBase64 }
        : undefined,
    );
  }, [current, setValue]);

  const previewTitle = live?.title?.trim() || 'Título do cartão';
  const previewBody = live?.body?.trim() || 'Conteúdo do cartão';
  const selectedTone = useMemo(() => categoryTones[category], [category]);
  const saveDisabled = !(live?.title ?? '').trim();
  const fabBottom = 18;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: Platform.OS === 'web',
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const preview = asset.base64
        ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      setImagePreview(preview);
      setImagePayload({
        uri: asset.base64 ? undefined : (asset.uri ?? undefined),
        base64: asset.base64 ?? undefined,
      });
    } catch (error) {
      console.warn('[CardEditor] Falha ao selecionar imagem:', error);
      Alert.alert(
        t('user.imagePickErrorTitle', 'Não foi possível selecionar a imagem'),
        t('user.imagePickErrorBody', 'Tente novamente ou escolha outra imagem.'),
      );
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.title?.trim()) return;

    if (current) {
      await updateCard(current.id, {
        title: data.title.trim(),
        body: data.body ?? '',
        imageUri: imagePayload?.uri,
        imageBase64: imagePayload?.base64,
      });
    } else {
      await addCard({
        title: data.title.trim(),
        body: data.body ?? '',
        favorite: false,
        useBgMusic: false,
        imageUri: imagePayload?.uri,
        imageBase64: imagePayload?.base64,
      } satisfies Omit<Card, 'id' | 'createdAt' | 'updatedAt'>);
    }

    nav.goBack();
  };

  const onDelete = async () => {
    if (!current) return;
    await removeCard(current.id);
    nav.goBack();
  };

  const listenPreview = () => {
    const text = (live?.body ?? '').trim() || (live?.title ?? '').trim();
    if (text) void speak(text);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => nav.goBack()}
          style={({ pressed }) => [styles.backButton, pressed ? styles.buttonPressed : null]}
        >
          <ChevronLeftIcon />
        </Pressable>

        <Text style={[styles.pageTitle, fontTitle]}>
          {current ? 'Editar cartão' : 'Adicionar cartão'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: fabBottom + 90 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <FieldLabel>{t('user.title', 'Título')}</FieldLabel>
          <Controller
            name="title"
            control={control}
            rules={{ required: true, minLength: 1 }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={t('user.titlePh', 'Ex.: Lembre-se de respirar...')}
                placeholderTextColor={hexToRgba(tokens.colors.textMuted, 0.52)}
                style={[styles.input, fontBody]}
                maxLength={MAX_TITLE_LENGTH}
                accessibilityLabel={t('user.title', 'Título')}
              />
            )}
          />
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel>{t('user.body', 'Conteúdo')}</FieldLabel>
          <Controller
            name="body"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={t('user.bodyPh', 'Ex.: "Isso vai passar. Estou segura(o)."')}
                placeholderTextColor={hexToRgba(tokens.colors.textMuted, 0.52)}
                style={[styles.input, styles.textarea, fontBody]}
                multiline
                maxLength={MAX_BODY_LENGTH}
                textAlignVertical="top"
                accessibilityLabel={t('user.body', 'Conteúdo')}
              />
            )}
          />
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel>Categoria</FieldLabel>
          <View style={styles.categoryGrid}>
            {(Object.keys(categoryTones) as CategoryLabel[]).map(label => {
              const tone = categoryTones[label];
              const selected = category === label;

              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => setCategory(label)}
                  style={({ pressed }) => [
                    styles.categoryButton,
                    selected ? styles.categoryButtonSelected : null,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <View style={[styles.categoryButtonBadge, { backgroundColor: tone.bg }]}>
                    <CategoryIcon tone={tone} />
                  </View>
                  <Text
                    style={[
                      styles.categoryButtonLabel,
                      fontBody,
                      selected ? styles.categoryButtonLabelSelected : null,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel>Imagem (opcional)</FieldLabel>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              imagePreview ? 'Alterar imagem do cartão' : 'Adicionar imagem ao cartão'
            }
            onPress={pickImage}
            style={({ pressed }) => [styles.uploadZone, pressed ? styles.buttonPressed : null]}
          >
            {imagePreview ? (
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.imageThumb}
                  resizeMode="cover"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover imagem"
                  onPress={() => {
                    setImagePreview(undefined);
                    setImagePayload(undefined);
                  }}
                  style={({ pressed }) => [
                    styles.removeImageButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <CloseIcon />
                </Pressable>
              </View>
            ) : (
              <>
                <ImagePlusIcon />
                <Text style={[styles.uploadTitle, fontBody]}>Toque para adicionar</Text>
                <Text style={[styles.uploadHint, fontBody]}>JPG ou PNG até 5 MB</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.previewLabel, trackingWide]}>Pré-visualização</Text>
          <PreviewCard title={previewTitle} body={previewBody} category={selectedTone} />
          <SecondaryButton label={t('user.listen', 'Ouvir cartão')} onPress={listenPreview} />
        </View>

        {current ? (
          <View style={styles.fieldGroup}>
            <SecondaryButton
              label={t('user.delete', 'Excluir')}
              onPress={onDelete}
              variant="destructive"
            />
          </View>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.fabWrap, { bottom: fabBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('user.save', 'Salvar')}
          disabled={saveDisabled}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.fab,
            saveDisabled ? styles.fabDisabled : null,
            pressed && !saveDisabled ? styles.buttonPressed : null,
          ]}
        >
          <Text style={[styles.fabText, trackingWidest, fontTitle]}>
            {current ? 'Salvar alterações' : 'Salvar cartão'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexToRgba(tokens.colors.secondary, 0.24),
  },
  buttonPressed: {
    opacity: 0.8,
  },
  categoryButton: {
    flex: 1,
    minWidth: 58,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: tokens.colors.bg,
  },
  categoryButtonBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonLabel: {
    color: tokens.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
    textAlign: 'center',
  },
  categoryButtonLabelSelected: {
    color: tokens.colors.primary,
  },
  categoryButtonSelected: {
    borderColor: tokens.colors.primary,
    backgroundColor: hexToRgba(tokens.colors.secondary, 0.18),
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    marginHorizontal: 14,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDisabled: {
    backgroundColor: tokens.colors.secondary,
  },
  fabText: {
    color: tokens.colors.bg,
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: tokens.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: hexToRgba(tokens.colors.text, 0.08),
    backgroundColor: tokens.colors.bg,
  },
  imagePreviewWrap: {
    position: 'relative',
  },
  imageThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: hexToRgba(tokens.colors.text, 0.1),
    borderRadius: 14,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: tokens.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  pageTitle: {
    color: tokens.colors.text,
    fontSize: 17,
    lineHeight: 22,
  },
  previewBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: hexToRgba(tokens.colors.text, 0.07),
    backgroundColor: tokens.colors.bg,
    padding: 14,
  },
  previewDescription: {
    color: tokens.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  previewLabel: {
    color: hexToRgba(tokens.colors.textMuted, 0.72),
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  previewPlay: {
    width: 30,
    height: 30,
    marginLeft: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
  },
  previewTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    color: tokens.colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 2,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 390,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: hexToRgba(tokens.colors.text, 0.12),
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonDestructive: {
    borderColor: hexToRgba(tokens.colors.secondary, 0.42),
    backgroundColor: hexToRgba(tokens.colors.accent, 0.42),
  },
  secondaryButtonText: {
    color: tokens.colors.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  secondaryButtonTextDestructive: {
    color: tokens.colors.primary,
  },
  textarea: {
    minHeight: 108,
    paddingTop: 12,
  },
  uploadHint: {
    color: hexToRgba(tokens.colors.textMuted, 0.66),
    fontSize: 10,
    lineHeight: 14,
  },
  uploadTitle: {
    color: tokens.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  uploadZone: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: hexToRgba(tokens.colors.text, 0.1),
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
});
