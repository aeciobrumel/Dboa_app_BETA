// Editor de cartão: criar/editar com React Hook Form
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useCardsStore } from '@app/state/useCardsStore';

type FormValues = { title: string; body: string };

export default function CardEditor() {
  const { t } = useTranslation('cards');
  const nav = useNavigation();
  const route = useRoute<any>();
  const id: string | undefined = route.params?.id;
  const { cards, addCard, updateCard, removeCard } = useCardsStore();
  const current = cards.find(c => c.id === id);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { title: '', body: '' }
  });
  const live = useWatch({ control });

  useEffect(() => {
    if (current) {
      setValue('title', current.title);
      setValue('body', current.body);
    }
  }, [current, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!data.title?.trim()) return; // título obrigatório simples
    if (current) {
      await updateCard(current.id, { title: data.title.trim(), body: data.body ?? '' });
    } else {
      await addCard({ title: data.title.trim(), body: data.body ?? '', favorite: false, useBgMusic: false });
    }
    nav.goBack();
  };

  const onDelete = async () => {
    if (current) {
      await removeCard(current.id);
      nav.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{current ? t('user.edit', 'Editar cartão') : t('user.add', 'Adicionar cartão')}</Text>

      <Text style={styles.label}>{t('user.title', 'Título')}</Text>
      <Controller
        name="title"
        control={control}
        rules={{ required: true, minLength: 1 }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={t('user.titlePh', 'Ex.: Lembre-se de respirar...')}
            placeholderTextColor={tokens.colors.textMuted}
            style={styles.input}
            accessibilityLabel={t('user.title', 'Título')}
          />
        )}
      />

      <Text style={styles.label}>{t('user.body', 'Conteúdo')}</Text>
      <Controller
        name="body"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={t('user.bodyPh', 'Ex.: “Isso vai passar. Estou segura(o).”')}
            placeholderTextColor={tokens.colors.textMuted}
            style={[styles.input, { height: 120 }]}
            multiline
            textAlignVertical="top"
            accessibilityLabel={t('user.body', 'Conteúdo')}
          />
        )}
      />

      <BigButton label={t('user.save', 'Salvar')} onPress={handleSubmit(onSubmit)} />
      {/* Botão para ouvir o cartão (texto atual do formulário) */}
      <BigButton
        variant="secondary"
        label={t('user.listen', 'Ouvir cartão')}
        onPress={() => {
          const title = live?.title ?? '';
          const body = live?.body ?? '';
          const text = `${title}. ${body}`.trim();
          if (text) {
            // Import lazy para não pesar bundle
            import('@app/utils/speak').then(m => m.speak(text));
          }
        }}
      />
      {current ? (
        <BigButton variant="secondary" label={t('user.delete', 'Excluir')} onPress={onDelete} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 16, gap: 8 },
  title: { color: tokens.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { color: tokens.colors.text, fontSize: 14, marginTop: 8 },
  input: {
    backgroundColor: '#F4F6FA',
    color: tokens.colors.text,
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  }
});
