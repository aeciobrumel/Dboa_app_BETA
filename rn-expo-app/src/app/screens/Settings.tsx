import React from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import { useCardsStore } from '@app/state/useCardsStore';
import { useContactsStore, type EmergencyContactApp } from '@app/state/useContactsStore';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { tokens } from '@app/theme/tokens';
import { preferredVoiceAvailable, speak } from '@app/utils/speak';

type FormValues = {
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  bgVolume: number;
  narrationVolume: number;
  autoReadCards: boolean;
  ttsVoice: 'auto' | 'male' | 'female';
  ttsRate: number;
  ttsPitch: number;
};

const bodyFamily = Platform.select({
  web: 'system-ui, sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontBody = { fontFamily: bodyFamily };
const fontTitle = { fontFamily: tokens.typography.weights.bold };
const trackingWide = { fontFamily: tokens.typography.weights.bold, letterSpacing: 1.2 };
const trackingWidest = { fontFamily: tokens.typography.weights.bold, letterSpacing: 1.4 };
const shadowColor = tokens.colors.text;
const dangerColor = '#DC2626';

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

const webRangeStyle: Record<string, string | number> = {
  width: '100%',
  accentColor: tokens.colors.primary,
  cursor: 'pointer',
  margin: 0,
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toPercent = (value: number, min: number, max: number) => {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
};

const fromPercent = (percent: number, min: number, max: number) =>
  min + (clamp(percent, 0, 100) / 100) * (max - min);

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'link';

function ShieldCheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M12 3L5.5 5.6V11.8C5.5 16.1 8.2 20.1 12 21.5C15.8 20.1 18.5 16.1 18.5 11.8V5.6L12 3Z"
        stroke={tokens.colors.primary}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M9.4 12.2L11.2 14L14.8 10.4"
        stroke={tokens.colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SectionCard({
  label,
  children,
  safety = false,
}: {
  label: string;
  children: React.ReactNode;
  safety?: boolean;
}) {
  return (
    <View className="gap-2.5">
      <Text
        className="text-[14px] font-semibold uppercase"
        style={[trackingWide, { color: tokens.colors.textMuted }]}
      >
        {label}
      </Text>
      <View
        className={cn('rounded-2xl p-4 shadow-sm', safety && 'border-l-4 pl-3')}
        style={[
          { backgroundColor: tokens.colors.bg },
          safety ? { borderLeftColor: tokens.colors.secondary } : undefined,
        ]}
      >
        <View className="gap-4">{children}</View>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  variant = 'secondary',
  accessibilityLabel,
  small = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
  small?: boolean;
}) {
  const baseClass = small
    ? 'min-h-10 self-start rounded-xl px-3 py-2'
    : 'min-h-12 rounded-xl px-4 py-3';

  const variantClass =
    variant === 'primary'
      ? ''
      : variant === 'secondary'
        ? 'border'
        : variant === 'destructive'
          ? ''
          : 'bg-transparent';

  const textClass =
    variant === 'primary'
      ? ''
      : variant === 'secondary'
        ? ''
        : variant === 'destructive'
          ? ''
          : 'underline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        variant !== 'link' && 'items-center justify-center',
        variant === 'link' ? 'self-start px-0 py-0' : baseClass,
        variant !== 'destructive' && variant !== 'link' && variantClass,
      )}
      style={({ pressed }) => [
        variant === 'primary'
          ? { backgroundColor: tokens.colors.primary }
          : variant === 'secondary'
            ? {
                backgroundColor: tokens.colors.bg,
                borderColor: tokens.colors.secondary,
              }
            : variant === 'destructive'
              ? {
                  backgroundColor: hexToRgba(dangerColor, 0.08),
                  borderColor: hexToRgba(dangerColor, 0.28),
                  borderWidth: 1,
                }
              : undefined,
        pressed ? { opacity: 0.8 } : undefined,
      ]}
    >
      <Text
        className={cn('text-[15px] font-semibold', small && 'text-sm', textClass)}
        style={[
          fontBody,
          variant === 'primary'
            ? { color: '#FFFFFF' }
            : variant === 'destructive'
              ? { color: dangerColor }
              : variant === 'secondary'
                ? { color: tokens.colors.text }
                : { color: tokens.colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="rounded-xl border px-3.5 py-2.5"
      style={({ pressed }) => [
        {
          borderColor: active ? tokens.colors.primary : tokens.colors.secondary,
          backgroundColor: active ? hexToRgba(tokens.colors.secondary, 0.28) : tokens.colors.bg,
        },
        pressed ? { opacity: 0.8 } : undefined,
      ]}
    >
      <Text
        className="text-sm font-medium"
        style={[fontBody, { color: active ? tokens.colors.primary : tokens.colors.textMuted }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleControl({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
}) {
  const translateX = React.useRef(new Animated.Value(value ? 20 : 2)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 2,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [translateX, value]);

  return (
    <View className="flex-row items-center gap-2.5">
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: value }}
        onPress={() => onChange(!value)}
        className="h-7 w-[46px] justify-center rounded-full px-0.5"
        style={{
          backgroundColor: value ? tokens.colors.primary : hexToRgba(tokens.colors.secondary, 0.45),
        }}
      >
        <Animated.View
          style={[
            {
              transform: [{ translateX }],
              shadowColor,
              shadowOpacity: 0.18,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
              backgroundColor: tokens.colors.bg,
            },
          ]}
          className="h-6 w-6 rounded-full"
        />
      </Pressable>
      <Text className="min-w-[64px] text-xs" style={[fontBody, { color: tokens.colors.textMuted }]}>
        {value ? 'Ativado' : 'Desativado'}
      </Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <View
      className="flex-row items-center justify-between gap-3 rounded-2xl px-3.5 py-3"
      style={{ backgroundColor: tokens.colors.inputBg }}
    >
      <View className="flex-1 gap-1">
        <Text
          className="text-[15px] font-semibold"
          style={[fontBody, { color: tokens.colors.text }]}
        >
          {label}
        </Text>
        {description ? (
          <Text
            className="text-[13px] leading-[18px]"
            style={[fontBody, { color: tokens.colors.textMuted }]}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <ToggleControl value={value} onChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

function RangeControl({
  value,
  onChange,
  min,
  max,
  accessibilityLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  accessibilityLabel: string;
}) {
  const percent = toPercent(value, min, max);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const thumbSize = 22;
  const thumbLeft = trackWidth
    ? clamp((percent / 100) * trackWidth - thumbSize / 2, 0, trackWidth - thumbSize)
    : 0;

  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
      value: percent,
      'aria-label': accessibilityLabel,
      onChange: (event: { target: { value: string } }) =>
        onChange(fromPercent(Number(event.target.value), min, max)),
      style: webRangeStyle,
    });
  }

  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => {
        const delta = (max - min) / 20;
        if (event.nativeEvent.actionName === 'increment') {
          onChange(clamp(value + delta, min, max));
          return;
        }
        if (event.nativeEvent.actionName === 'decrement') {
          onChange(clamp(value - delta, min, max));
        }
      }}
      onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
      onPress={event => {
        if (!trackWidth) return;
        const next = fromPercent((event.nativeEvent.locationX / trackWidth) * 100, min, max);
        onChange(clamp(next, min, max));
      }}
      className="h-7 justify-center"
    >
      <View
        className="h-1.5 rounded-full"
        style={{ backgroundColor: hexToRgba(tokens.colors.secondary, 0.45) }}
      />
      <View
        className="absolute left-0 h-1.5 rounded-full"
        style={{ width: `${percent}%`, backgroundColor: tokens.colors.primary }}
      />
      <View
        className="absolute top-0.5 h-[22px] w-[22px] rounded-full border"
        style={{
          left: thumbLeft,
          borderColor: hexToRgba(tokens.colors.secondary, 0.45),
          backgroundColor: tokens.colors.bg,
          shadowColor,
          shadowOpacity: 0.12,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View
      className="gap-3 rounded-2xl px-3.5 py-3"
      style={{ backgroundColor: tokens.colors.inputBg }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-[15px] font-semibold"
          style={[fontBody, { color: tokens.colors.text }]}
        >
          {label}
        </Text>
        <View
          className="min-w-[52px] items-center rounded-full px-3 py-1.5"
          style={{ backgroundColor: hexToRgba(tokens.colors.secondary, 0.28) }}
        >
          <Text className="text-xs font-bold" style={[fontBody, { color: tokens.colors.text }]}>
            {toPercent(value, min, max)}%
          </Text>
        </View>
      </View>
      <RangeControl
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation(['settings', 'app']);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const settings = useSettingsStore();
  const cardsStore = useCardsStore();
  const contacts = useContactsStore(state => state.contacts);
  const addContact = useContactsStore(state => state.addContact);
  const updateContact = useContactsStore(state => state.updateContact);
  const removeContact = useContactsStore(state => state.removeContact);
  const [contactName, setContactName] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactApp, setContactApp] = React.useState<EmergencyContactApp>('whatsapp');
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null);
  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      hapticsEnabled: settings.hapticsEnabled,
      telemetryOptIn: settings.telemetryOptIn,
      bgVolume: settings.bgVolume,
      narrationVolume: settings.narrationVolume,
      autoReadCards: settings.autoReadCards,
      ttsVoice: settings.ttsVoice,
      ttsRate: settings.ttsRate,
      ttsPitch: settings.ttsPitch,
    },
  });

  React.useEffect(() => {
    const sub = watch(values => {
      settings.setPreferences(values);
    });
    return () => sub.unsubscribe();
  }, [watch, settings]);

  const resetContactForm = React.useCallback(() => {
    setContactName('');
    setContactPhone('');
    setContactApp('whatsapp');
    setEditingContactId(null);
  }, []);

  const handleSaveContact = React.useCallback(() => {
    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();

    if (!trimmedName || !trimmedPhone) {
      Alert.alert(
        t('settings:trustedContactValidationTitle', 'Preencha os campos'),
        t(
          'settings:trustedContactValidationBody',
          'Informe nome e telefone do contato de confiança.',
        ),
      );
      return;
    }

    if (!editingContactId && contacts.length >= 3) {
      Alert.alert(
        t('settings:trustedContactLimitTitle', 'Limite atingido'),
        t('settings:trustedContactLimitBody', 'Você pode cadastrar até 3 contatos de confiança.'),
      );
      return;
    }

    if (editingContactId) {
      updateContact(editingContactId, {
        name: trimmedName,
        phone: trimmedPhone,
        app: contactApp,
      });
    } else {
      addContact({
        name: trimmedName,
        phone: trimmedPhone,
        app: contactApp,
      });
    }

    resetContactForm();
  }, [
    addContact,
    contactApp,
    contactName,
    contactPhone,
    contacts.length,
    editingContactId,
    resetContactForm,
    t,
    updateContact,
  ]);

  const handleEditContact = React.useCallback(
    (id: string) => {
      const contact = contacts.find(item => item.id === id);
      if (!contact) {
        return;
      }

      setEditingContactId(contact.id);
      setContactName(contact.name);
      setContactPhone(contact.phone);
      setContactApp(contact.app);
    },
    [contacts],
  );

  const handleRemoveContact = React.useCallback(
    (id: string, name: string) => {
      Alert.alert(
        t('settings:trustedContactRemoveTitle', 'Remover contato?'),
        t('settings:trustedContactRemoveBody', {
          name,
          defaultValue: 'Isso removerá {{name}} da sua lista de apoio.',
        }),
        [
          { text: t('app:common.cancel', 'Cancelar'), style: 'cancel' },
          {
            text: t('settings:trustedContactRemoveConfirm', 'Remover'),
            style: 'destructive',
            onPress: () => {
              if (editingContactId === id) {
                resetContactForm();
              }
              removeContact(id);
            },
          },
        ],
      );
    },
    [editingContactId, removeContact, resetContactForm, t],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.colors.bg }}>
      <View
        pointerEvents="none"
        className="absolute -right-10 -top-16 h-56 w-56 rounded-full"
        style={{ backgroundColor: hexToRgba(tokens.colors.accent, 0.5) }}
      />
      <View
        pointerEvents="none"
        className="absolute -left-20 bottom-20 h-56 w-56 rounded-full"
        style={{ backgroundColor: hexToRgba(tokens.colors.secondary, 0.28) }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('settings:title')}
      >
        <View className="w-full max-w-[390px] self-center gap-5 px-4 pb-10 pt-6">
          <View className="gap-2.5 pt-2">
            <Text
              className="text-xs font-semibold uppercase"
              style={[trackingWidest, { color: tokens.colors.textMuted }]}
            >
              Configurações
            </Text>
            <Text
              className="text-[30px] leading-9"
              style={[fontTitle, { color: tokens.colors.text }]}
            >
              {t('settings:title')}
            </Text>
            <Text
              className="text-sm leading-5"
              style={[fontBody, { color: tokens.colors.textMuted }]}
            >
              Ajuste áudio, privacidade e apoio rápido com uma interface mais clara e calma.
            </Text>
          </View>

          <SectionCard label="Geral">
            <View className="gap-2.5">
              <Text
                className="text-[15px] font-semibold"
                style={[fontBody, { color: tokens.colors.text }]}
              >
                {t('settings:language')}
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                <OptionChip
                  label="Português"
                  active={i18n.language === 'pt-BR'}
                  onPress={() => i18n.changeLanguage('pt-BR')}
                />
                <OptionChip
                  label="Español"
                  active={i18n.language === 'es'}
                  onPress={() => i18n.changeLanguage('es')}
                />
              </View>
            </View>

            <Controller
              name="hapticsEnabled"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ToggleRow
                  label={t('settings:haptics')}
                  description="Toques sutis para confirmar ações importantes."
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </SectionCard>

          <SectionCard label="Áudio">
            <Controller
              name="bgVolume"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SliderField label={t('settings:bgMusic')} value={value} onChange={onChange} />
              )}
            />

            <View
              className="flex-row items-center justify-between gap-3 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: tokens.colors.inputBg }}
            >
              <View className="flex-1 gap-1">
                <Text
                  className="text-[15px] font-semibold"
                  style={[fontBody, { color: tokens.colors.text }]}
                >
                  Trilha selecionada
                </Text>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={[fontBody, { color: tokens.colors.textMuted }]}
                >
                  {settings.bgMusicUri
                    ? t('settings:customMusic', 'Música personalizada selecionada')
                    : t('settings:defaultMusic', 'Usando música padrão')}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: hexToRgba(tokens.colors.secondary, 0.28) }}
              >
                <Text
                  className="text-xs font-bold"
                  style={[fontBody, { color: tokens.colors.primary }]}
                >
                  {settings.bgMusicUri ? 'Personalizada' : 'Padrão'}
                </Text>
              </View>
            </View>

            <View className="gap-2.5 pt-1">
              <ActionButton
                variant="primary"
                label={t('settings:chooseMusic', 'Escolher música de fundo')}
                onPress={async () => {
                  try {
                    const res = await DocumentPicker.getDocumentAsync({
                      type: 'audio/*',
                      copyToCacheDirectory: true,
                    });
                    if (res.canceled) return;
                    const uri = res.assets?.[0]?.uri;
                    if (uri) settings.setPreferences({ bgMusicUri: uri, bgEnabled: true });
                  } catch (error) {
                    console.warn('[Settings] Falha ao selecionar música:', error);
                    Alert.alert(
                      t('settings:musicPickErrorTitle', 'Não foi possível selecionar o áudio'),
                      t(
                        'settings:musicPickErrorBody',
                        'Tente novamente ou escolha outro arquivo de áudio.',
                      ),
                    );
                  }
                }}
              />
              <ActionButton
                variant="secondary"
                label={t('settings:resetMusic', 'Usar música padrão')}
                onPress={() => settings.setPreferences({ bgMusicUri: undefined })}
              />
            </View>
          </SectionCard>

          <SectionCard label="Narração">
            <Controller
              name="narrationVolume"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SliderField label={t('settings:narration')} value={value} onChange={onChange} />
              )}
            />

            <Controller
              name="autoReadCards"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ToggleRow
                  label={t('settings:autoReadCards', 'Leitura automática dos cartões')}
                  description="Inicia a leitura assim que um cartão é aberto."
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <View className="gap-2.5">
              <Text
                className="text-[15px] font-semibold"
                style={[fontTitle, { color: tokens.colors.text }]}
              >
                {t('settings:voiceTitle', 'Voz da narração')}
              </Text>
              <Controller
                name="ttsVoice"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <View
                    className="flex-row flex-wrap gap-2.5 rounded-2xl px-3.5 py-3"
                    style={{ backgroundColor: tokens.colors.inputBg }}
                  >
                    <OptionChip
                      label={t('settings:voiceAuto', 'Auto')}
                      active={value === 'auto'}
                      onPress={() => onChange('auto')}
                    />
                    <OptionChip
                      label={t('settings:voiceFemale', 'Feminina')}
                      active={value === 'female'}
                      onPress={() => onChange('female')}
                    />
                    <OptionChip
                      label={t('settings:voiceMale', 'Masculina')}
                      active={value === 'male'}
                      onPress={() => onChange('male')}
                    />
                  </View>
                )}
              />
            </View>

            <Controller
              name="ttsRate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SliderField
                  label={t('settings:rate', 'Velocidade')}
                  value={value}
                  onChange={onChange}
                  min={0.1}
                  max={2}
                />
              )}
            />

            <Controller
              name="ttsPitch"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SliderField
                  label={t('settings:pitch', 'Tom')}
                  value={value}
                  onChange={onChange}
                  min={0.1}
                  max={2}
                />
              )}
            />

            <ActionButton
              variant="secondary"
              label={t('settings:voicePreview', 'Pré‑visualizar voz')}
              onPress={async () => {
                const ok = await preferredVoiceAvailable();
                await speak(t('settings:voicePreviewText', 'Olá, esta é a voz que vai te guiar.'));
                if (!ok) {
                  setTimeout(
                    () =>
                      speak(
                        t(
                          'settings:voiceWarnNotAvailable',
                          'Aviso: a voz escolhida pode não estar disponível neste dispositivo. Usaremos a alternativa disponível.',
                        ),
                      ),
                    600,
                  );
                }
              }}
            />
          </SectionCard>

          <SectionCard label="Privacidade">
            <Controller
              name="telemetryOptIn"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ToggleRow
                  label={t('settings:telemetry')}
                  description="Compartilhe dados de uso anônimos para melhorar o app."
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <View
              className="gap-2 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: tokens.colors.inputBg }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={[fontTitle, { color: tokens.colors.text }]}
              >
                Seus dados
              </Text>
              <ActionButton
                variant="link"
                label="Política de Privacidade"
                onPress={() => navigation.navigate('Legal')}
              />
            </View>
          </SectionCard>

          <SectionCard label="Contato de Confiança" safety>
            <View
              className="flex-row items-start gap-3 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: hexToRgba(tokens.colors.accent, 0.6) }}
            >
              <View
                className="mt-0.5 h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: tokens.colors.bg }}
              >
                <ShieldCheckIcon />
              </View>
              <View className="flex-1 gap-1">
                <Text
                  className="text-base font-bold"
                  style={[fontTitle, { color: tokens.colors.text }]}
                >
                  {t('settings:trustedContactsTitle', 'Contato de confiança')}
                </Text>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={[fontBody, { color: tokens.colors.textMuted }]}
                >
                  {t(
                    'settings:trustedContactsDescription',
                    'Esse contato aparece no botão de emergência para pedir apoio rapidamente.',
                  )}
                </Text>
              </View>
            </View>

            <View className="gap-2.5">
              <Text
                className="text-sm font-semibold"
                style={[fontBody, { color: tokens.colors.text }]}
              >
                {t('settings:trustedContactName', 'Nome')}
              </Text>
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder={t('settings:trustedContactNamePlaceholder', 'Ex.: Ana')}
                placeholderTextColor={tokens.colors.textMuted}
                accessibilityLabel={t('settings:trustedContactName', 'Nome')}
                className="rounded-xl border px-4 py-3 text-[15px]"
                style={[
                  fontBody,
                  {
                    color: tokens.colors.text,
                    borderColor: tokens.colors.secondary,
                    backgroundColor: tokens.colors.inputBg,
                  },
                ]}
              />
            </View>

            <View className="gap-2.5">
              <Text
                className="text-sm font-semibold"
                style={[fontBody, { color: tokens.colors.text }]}
              >
                {t('settings:trustedContactPhone', 'Telefone')}
              </Text>
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder={t('settings:trustedContactPhonePlaceholder', 'Ex.: +55 11 99999-9999')}
                placeholderTextColor={tokens.colors.textMuted}
                keyboardType="phone-pad"
                accessibilityLabel={t('settings:trustedContactPhone', 'Telefone')}
                className="rounded-xl border px-4 py-3 text-[15px]"
                style={[
                  fontBody,
                  {
                    color: tokens.colors.text,
                    borderColor: tokens.colors.secondary,
                    backgroundColor: tokens.colors.inputBg,
                  },
                ]}
              />
            </View>

            <View className="gap-2.5">
              <Text
                className="text-sm font-semibold"
                style={[fontBody, { color: tokens.colors.text }]}
              >
                {t('settings:trustedContactChannel', 'Canal preferido')}
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                <OptionChip
                  label={t('settings:trustedContactWhatsapp', 'WhatsApp')}
                  active={contactApp === 'whatsapp'}
                  onPress={() => setContactApp('whatsapp')}
                />
                <OptionChip
                  label={t('settings:trustedContactSms', 'SMS')}
                  active={contactApp === 'sms'}
                  onPress={() => setContactApp('sms')}
                />
              </View>
            </View>

            <View className="gap-2.5">
              <ActionButton
                variant="primary"
                label={
                  editingContactId
                    ? t('settings:trustedContactUpdate', 'Salvar alterações')
                    : t('settings:trustedContactAdd', 'Adicionar contato')
                }
                onPress={handleSaveContact}
              />
              {editingContactId ? (
                <ActionButton
                  variant="secondary"
                  label={t('settings:trustedContactCancelEdit', 'Cancelar edição')}
                  onPress={resetContactForm}
                />
              ) : null}
            </View>

            <Text
              className="text-center text-xs"
              style={[fontBody, { color: tokens.colors.textMuted }]}
            >
              {t('settings:trustedContactCounter', {
                count: contacts.length,
                defaultValue: '{{count}} de 3 contatos cadastrados',
              })}
            </Text>

            {contacts.length === 0 ? (
              <View
                className="rounded-2xl p-3.5"
                style={{ backgroundColor: tokens.colors.inputBg }}
              >
                <Text
                  className="text-[13px] leading-[18px]"
                  style={[fontBody, { color: tokens.colors.textMuted }]}
                >
                  {t(
                    'settings:trustedContactEmpty',
                    'Nenhum contato cadastrado ainda. Adicione pelo menos um para aparecer na ajuda imediata.',
                  )}
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                {contacts.map(contact => (
                  <View
                    key={contact.id}
                    className="gap-3 rounded-2xl p-3.5"
                    style={{ backgroundColor: tokens.colors.inputBg }}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text
                          className="text-[15px] font-bold"
                          style={[fontBody, { color: tokens.colors.text }]}
                        >
                          {contact.name}
                        </Text>
                        <Text
                          className="text-sm"
                          style={[fontBody, { color: tokens.colors.textMuted }]}
                        >
                          {contact.phone}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-2.5 py-1.5"
                        style={{ backgroundColor: hexToRgba(tokens.colors.secondary, 0.28) }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={[fontBody, { color: tokens.colors.primary }]}
                        >
                          {contact.app === 'whatsapp'
                            ? t('settings:trustedContactWhatsapp', 'WhatsApp')
                            : t('settings:trustedContactSms', 'SMS')}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3">
                      <ActionButton
                        variant="secondary"
                        small
                        label={t('settings:trustedContactEdit', 'Editar')}
                        onPress={() => handleEditContact(contact.id)}
                      />
                      <ActionButton
                        variant="destructive"
                        small
                        label={t('settings:trustedContactRemove', 'Remover')}
                        onPress={() => handleRemoveContact(contact.id, contact.name)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </SectionCard>

          <SectionCard label="Cartões">
            <View
              className="gap-1.5 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: tokens.colors.inputBg }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={[fontTitle, { color: tokens.colors.text }]}
              >
                {t('settings:cardsSection', 'Cartões')}
              </Text>
              <Text
                className="text-[13px] leading-[18px]"
                style={[fontBody, { color: tokens.colors.textMuted }]}
              >
                Restaure a coleção padrão se quiser recomeçar sua biblioteca do zero.
              </Text>
            </View>

            <ActionButton
              variant="destructive"
              label={t('settings:restoreCards', 'Restaurar cartões padrão')}
              onPress={() => {
                Alert.alert(
                  t('settings:restoreConfirmTitle', 'Restaurar cartões?'),
                  t(
                    'settings:restoreConfirmBody',
                    'Isso substituirá seus cartões atuais pelos padrões.',
                  ),
                  [
                    { text: t('app:common.cancel', 'Cancelar'), style: 'cancel' },
                    {
                      text: t('settings:restoreConfirmOk', 'Restaurar'),
                      style: 'destructive',
                      onPress: async () => {
                        await cardsStore.restoreDefaults();
                        Alert.alert(
                          t('settings:restoreDoneTitle', 'Feito'),
                          t('settings:restoreDoneBody', 'Cartões padrão restaurados.'),
                        );
                      },
                    },
                  ],
                );
              }}
            />
          </SectionCard>
        </View>
      </ScrollView>
    </View>
  );
}
