// Tela simples para exibir Política de Privacidade e Termos (texto local)
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, Linking } from 'react-native';
import Constants from 'expo-constants';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';

export default function Legal() {
  const [section, setSection] = useState<'privacy' | 'terms'>('privacy');
  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable onPress={() => setSection('privacy')} style={[styles.chip, section === 'privacy' && styles.chipActive]}>
          <Text style={[styles.chipText, section === 'privacy' && styles.chipTextActive]}>Política de Privacidade</Text>
        </Pressable>
        <Pressable onPress={() => setSection('terms')} style={[styles.chip, section === 'terms' && styles.chipActive]}>
          <Text style={[styles.chipText, section === 'terms' && styles.chipTextActive]}>Termos de Uso</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{section === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso'}</Text>
        <Text style={styles.body}>
          {section === 'privacy'
            ? 'Este aplicativo armazena seus dados localmente no dispositivo. Não coletamos nem transferimos dados pessoais para servidores. Permissões: Biblioteca de fotos (imagens dos cartões), Arquivos (música de fundo), Áudio em segundo plano (música).'
            : 'Este app oferece apoio ao bem‑estar (ex.: respiração). Não é um dispositivo médico nem substitui atendimento profissional. Em risco, procure ajuda emergencial local. O uso é pessoal; o conteúdo que você adiciona é de sua responsabilidade.'}
        </Text>
        {(() => {
          const extras: any = (Constants as any).expoConfig?.extra || (Constants as any).manifest?.extra || {};
          const privacy = extras?.legal?.privacyUrl;
          const terms = extras?.legal?.termsUrl;
          const url = section === 'privacy' ? privacy : terms;
          if (!url) return null;
          return (
            <Pressable accessibilityRole="button" onPress={() => Linking.openURL(url)}>
              <Text style={styles.link}>Abrir versão online</Text>
            </Pressable>
          );
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
  tabs: { flexDirection: 'row', gap: 8, padding: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: tokens.colors.secondary },
  chipActive: { backgroundColor: tokens.colors.secondary },
  chipText: { color: tokens.colors.textMuted },
  chipTextActive: { color: '#000', fontFamily: 'Lemondrop-Bold' },
  scroll: { padding: 16, gap: 12 },
  title: { color: tokens.colors.text, fontSize: 18, fontFamily: 'Lemondrop-Bold' },
  body: { color: tokens.colors.text, fontSize: 14, lineHeight: 20 },
  link: { color: tokens.colors.primary, textDecorationLine: 'underline' }
});
