// Lista de cartões personalizados do usuário
// Foco: simplicidade e acessibilidade; CRUD fora do fluxo de crise
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCardsStore } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';
import { tap } from '@app/utils/haptics';
import SpeakButton from '@app/components/SpeakButton';

export default function CardsList() {
  const { t } = useTranslation('cards');
  const nav = useNavigation();
  const { cards, hydrate, toggleFavorite } = useCardsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const sorted = useMemo(() => {
    // Favoritos primeiro, depois por atualização
    return [...cards].sort((a, b) => (Number(b.favorite) - Number(a.favorite)) || b.updatedAt - a.updatedAt);
  }, [cards]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('user.listTitle', 'Meus Cartões')}</Text>
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24, flexGrow: 1 }}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => nav.navigate('CardEditor' as never, { id: item.id } as never)}
            style={[styles.card, { borderColor: item.favorite ? tokens.colors.primary : tokens.colors.secondary }]}
            onLongPress={async () => {
              await tap();
              toggleFavorite(item.id);
            }}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.favorite ? '★ ' : ''}
              {item.title}
            </Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.body}
            </Text>
            <SpeakButton text={`${item.title}. ${item.body}`} style={{ marginTop: 8 }} />
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('user.empty', 'Nenhum cartão ainda')}</Text>}
      />
      <View style={styles.footer}>
        <BigButton
          label={t('user.add', 'Adicionar cartão')}
          onPress={() => nav.navigate('CardEditor' as never)}
          accessibilityLabel={t('user.addA11y', 'Adicionar novo cartão')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 16 },
  title: { color: tokens.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  empty: { color: tokens.colors.textMuted, textAlign: 'center', marginTop: 24 },
  card: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    backgroundColor: tokens.colors.surface
  },
  cardTitle: { color: tokens.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  cardBody: { color: tokens.colors.textMuted, fontSize: 14, textAlign: 'center' },
  footer: { paddingBottom: 8 }
});
