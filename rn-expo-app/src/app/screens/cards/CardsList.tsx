// Lista de cartões personalizados do usuário
// Foco: simplicidade e acessibilidade; CRUD fora do fluxo de crise
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Image, FlatList } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCardsStore } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';
import ScreenCornerShapes from '@app/components/ScreenCornerShapes';
// Removido blobs por card a pedido do usuário
import { tap } from '@app/utils/haptics';
import SpeakButton from '@app/components/SpeakButton';
import { useSettingsStore } from '@app/state/useSettingsStore';

export default function CardsList() {
  const { t } = useTranslation('cards');
  const nav = useNavigation();
  const { cards, hydrate, toggleFavorite, reorder } = useCardsStore();
  const { breathCycles, breathListIndex, setPreferences } = useSettingsStore();
  const [mode, setMode] = useState<'gallery' | 'reorder'>('gallery');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Exibe na ordem salva. O reordenamento por drag atualiza o array persistido.

  const data = useMemo(() => {
    const breathItem = { id: '__breath__', type: 'breath' } as any;
    const idx = Math.max(0, Math.min(breathListIndex ?? 0, cards.length));
    const before = cards.slice(0, idx);
    const after = cards.slice(idx);
    return [...before, breathItem, ...after];
  }, [cards, breathListIndex]);

  return (
    <View style={styles.container}>
      <ScreenCornerShapes />
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => (nav.getParent() as any)?.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('app:common.goHome', 'Voltar')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('user.listTitle', 'Meus Cartões')}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={() => setMode('gallery')} style={[styles.modeBtn, mode === 'gallery' && styles.modeBtnActive]}>
          <Text style={[styles.modeText, mode === 'gallery' && styles.modeTextActive]}>{t('user.gallery', 'Galeria')}</Text>
        </Pressable>
        <Pressable onPress={() => setMode('reorder')} style={[styles.modeBtn, mode === 'reorder' && styles.modeBtnActive]}>
          <Text style={[styles.modeText, mode === 'reorder' && styles.modeTextActive]}>{t('user.reorder', 'Reordenar')}</Text>
        </Pressable>
      </View>

      {mode === 'reorder' ? (
      <DraggableFlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        activationDistance={8}
        autoscrollThreshold={80}
        autoscrollSpeed={300}
        dragItemOverflow
        renderItem={({ item, drag, isActive }: RenderItemParams<any>) => {
          if (item.type === 'breath') {
            return (
              <View style={[styles.shadowCard, { opacity: isActive ? 0.9 : 1 }]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => nav.navigate('BreathEditor' as never)}
                  style={[styles.card, { borderColor: tokens.colors.secondary, flexDirection: 'row', alignItems: 'center' }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {t('breath.title')}
                    </Text>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {t('breath.subtitle', 'Inspire 4s, segure 4s, expire 6s')} — {breathCycles} ciclos
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={t('user.reorderHandle', 'Reordenar')}
                    onPressIn={drag}
                    onLongPress={drag}
                    style={styles.handle}
                  >
                    <Text style={styles.handleIcon}>≡</Text>
                  </Pressable>
                </Pressable>
              </View>
            );
          }
          return (
            <View style={[styles.shadowCard, { opacity: isActive ? 0.9 : 1 }] }>
              <Pressable
                accessibilityRole="button"
                onPress={() => nav.navigate('CardEditor' as never, { id: item.id } as never)}
                style={[styles.card, { borderColor: item.favorite ? tokens.colors.primary : tokens.colors.secondary, flexDirection: 'row', alignItems: 'center' }]}
                onLongPress={async () => {
                  await tap();
                  toggleFavorite(item.id);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.favorite ? '★ ' : ''}
                    {item.title}
                  </Text>
                  { (item.imageBase64 || item.imageUri) ? (
                    <Image
                      source={{ uri: item.imageBase64 ? `data:image/jpeg;base64,${item.imageBase64}` : item.imageUri }}
                      style={styles.thumb}
                      resizeMode="cover"
                    />
                  ) : null }
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <SpeakButton text={item.body} style={{ marginTop: 8 }} />
                </View>
                <Pressable
                  accessibilityLabel={t('user.reorderHandle', 'Reordenar')}
                  onPressIn={drag}
                  onLongPress={drag}
                  style={styles.handle}
                >
                  <Text style={styles.handleIcon}>≡</Text>
                </Pressable>
              </Pressable>
            </View>
          );
        }}
        onDragEnd={({ data: next }) => {
          const breathIdx = next.findIndex((it: any) => it.type === 'breath');
          const onlyCards = next.filter((it: any) => it.type !== 'breath');
          setPreferences({ breathListIndex: Math.max(0, breathIdx) });
          reorder(onlyCards);
        }}
        ListEmptyComponent={<Text style={styles.empty}>{t('user.empty', 'Nenhum cartão ainda')}</Text>}
      />
      ) : (
      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, justifyContent: 'space-between' }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => {
          if (item.type === 'breath') {
            return (
              <View style={[styles.shadowCard, styles.tileWrapper]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => nav.navigate('BreathEditor' as never)}
                  style={[styles.tile, { borderColor: tokens.colors.secondary }]}
                >
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {t('breath.title')}
                  </Text>
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {t('breath.subtitle', 'Inspire 4s, segure 4s, expire 6s')} — {breathCycles} ciclos
                  </Text>
                </Pressable>
              </View>
            );
          }
          return (
            <View style={[styles.shadowCard, styles.tileWrapper]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => nav.navigate('CardEditor' as never, { id: item.id } as never)}
                onLongPress={async () => { await tap(); toggleFavorite(item.id); }}
                style={[styles.tile, { borderColor: item.favorite ? tokens.colors.primary : tokens.colors.secondary }]}
              >
                {(item.imageBase64 || item.imageUri) ? (
                  <Image
                    source={{ uri: item.imageBase64 ? `data:image/jpeg;base64,${item.imageBase64}` : item.imageUri }}
                    style={styles.tileImage}
                    resizeMode="cover"
                  />
                ) : null}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.favorite ? '★ ' : ''}
                  {item.title}
                </Text>
                <Text style={styles.cardBody} numberOfLines={2}>
                  {item.body}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>{t('user.empty', 'Nenhum cartão ainda')}</Text>}
      />
      )}
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
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 16, position: 'relative' },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: tokens.colors.textMuted, fontSize: 14 },
  title: { color: tokens.colors.text, fontSize: 22, marginBottom: 12, textAlign: 'center', fontFamily: 'Lemondrop-Bold' },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  modeBtn: { borderWidth: 1, borderColor: tokens.colors.secondary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  modeBtnActive: { backgroundColor: tokens.colors.secondary },
  modeText: { color: tokens.colors.textMuted },
  modeTextActive: { color: '#000', fontFamily: 'Lemondrop-Bold' },
  empty: { color: tokens.colors.textMuted, textAlign: 'center', marginTop: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  tile: {
    flex: 1,
    height: 220,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'space-between'
  },
  shadowCard: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tileWrapper: { width: '48%' },
  tileImage: { width: '100%', height: 110, borderRadius: 10 },
  cardTitle: { color: tokens.colors.text, fontSize: 16, marginBottom: 6, textAlign: 'center', fontFamily: 'Lemondrop-Bold' },
  cardBody: { color: tokens.colors.textMuted, fontSize: 14, textAlign: 'center' },
  footer: { paddingBottom: 8 },
  handle: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  handleIcon: { fontSize: 20, color: tokens.colors.textMuted },
  thumb: { width: '100%', height: 120, borderRadius: 8, marginVertical: 8 }
});
