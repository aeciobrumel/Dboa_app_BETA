// Fim da sessão: opção de encerrar rapidamente
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { tokens } from '@app/theme/tokens';
import { useSessionStore } from '@app/state/useSessionStore';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import type { SessionStackParamList } from '@app/navigation/SessionNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function SessionEnd() {
  const navigation = useNavigation<NativeStackNavigationProp<SessionStackParamList>>();
  const { t } = useTranslation(['app']);
  const moodRating = useSessionStore(state => state.moodRating);
  const setMoodRating = useSessionStore(state => state.setMoodRating);
  const moodLabels = useMemo(() => {
    const items = t('sessionEnd.moods.labels', { returnObjects: true });
    return Array.isArray(items)
      ? items.map(item => String(item))
      : ['Muito mal', 'Mal', 'Neutro', 'Melhor', 'Bem'];
  }, [t]);
  const moodEmojis = ['😣', '😕', '😐', '🙂', '😌'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text accessible={false} style={styles.headerEmoji}>
            🤍
          </Text>
          <Text style={styles.title}>
            {t('sessionEnd.title', 'Você fez algo importante por si mesmo. Isso exige coragem.')}
          </Text>
          <View style={styles.questionWrap}>
            <Text accessible={false} style={styles.questionEmoji}>
              🌤️
            </Text>
            <Text style={styles.question}>{t('sessionEnd.question', 'Como você está agora?')}</Text>
          </View>

          <View style={styles.moodRow}>
            {moodLabels.map((label, index) => {
              const rating = index + 1;
              const selected = moodRating === rating;

              return (
                <Pressable
                  key={`${label}-${rating}`}
                  accessibilityRole="button"
                  accessibilityLabel={t('sessionEnd.moodOptionA11y', {
                    label,
                    rating,
                    defaultValue: '{{label}}, opção {{rating}}',
                  })}
                  onPress={() => setMoodRating(rating)}
                  style={styles.moodOption}
                >
                  <View
                    style={[
                      styles.moodCircle,
                      selected ? styles.moodCircleSelected : null,
                    ]}
                  >
                    <Text accessible={false} style={styles.moodEmoji}>
                      {moodEmojis[index] ?? '🙂'}
                    </Text>
                  </View>
                  <Text style={[styles.moodLabel, selected ? styles.moodLabelSelected : null]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.goBack()
          }
          accessibilityLabel={t('sessionEnd.goHomeA11y', 'Encerrar sessão e voltar ao início')}
          style={({ pressed }) => [styles.homeAction, pressed ? styles.homeActionPressed : null]}
        >
          <Text style={styles.homeActionText}>{t('common.goHome')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing(3),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing(2),
  },
  footer: {
    paddingBottom: tokens.spacing(1),
  },
  homeAction: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing(1),
    paddingVertical: tokens.spacing(0.5),
  },
  homeActionPressed: {
    opacity: 0.7,
  },
  homeActionText: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.body,
    fontFamily: tokens.typography.weights.regular,
    textAlign: 'center',
  },
  headerEmoji: {
    fontSize: 34,
  },
  moodCircle: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleSelected: {
    transform: [{ scale: 1.08 }],
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.caption,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.weights.bold,
  },
  moodOption: {
    width: '18%',
    alignItems: 'center',
    gap: tokens.spacing(0.75),
  },
  moodRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h3,
    textAlign: 'center',
  },
  questionEmoji: {
    fontSize: 24,
  },
  questionWrap: {
    alignItems: 'center',
    gap: tokens.spacing(0.5),
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: tokens.spacing(4),
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    textAlign: 'center',
    lineHeight: tokens.typography.sizes.h2 * tokens.typography.lineHeight.normal,
    fontFamily: tokens.typography.weights.bold,
  },
});
