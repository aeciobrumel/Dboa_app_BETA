// Pré-carregamento de assets para uso offline
import { Asset } from 'expo-asset';

export async function ensureOfflineAssets(modules: number[]) {
  await Promise.all(
    modules.map(async m => {
      try {
        const asset = Asset.fromModule(m);
        if (!asset.downloaded) await asset.downloadAsync();
      } catch {}
    })
  );
}

