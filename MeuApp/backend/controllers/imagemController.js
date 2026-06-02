const { supabase } = require('../config/supabase');
const crypto = require('crypto');

// Fazer upload de imagens para o Supabase Storage
const uploadImages = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  // Se Supabase não está configurado, retornar vazio
  if (!supabase) {
    console.warn('⚠️  Supabase não configurado. Upload de imagens desativado.');
    return [];
  }

  const uploadedUrls = [];

  for (const file of files) {
    try {
      // Gerar ID único usando crypto
      const uniqueId = crypto.randomBytes(12).toString('hex');
      const fileName = `${uniqueId}_${Date.now()}`;
      const fileExt = file.originalname.split('.').pop();
      const filePath = `servicos/${fileName}.${fileExt}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('servicos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) {
        console.error(`Erro ao fazer upload de ${file.originalname}:`, error);
        continue;
      }

      // Obter URL pública
      const { data: publicUrl } = supabase.storage
        .from('servicos')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl.publicUrl);
    } catch (err) {
      console.error(`Erro ao processar imagem ${file.originalname}:`, err);
    }
  }

  return uploadedUrls;
};

// Deletar imagens do Supabase Storage
const deleteImage = async (imageUrl) => {
  if (!supabase) {
    console.warn('⚠️  Supabase não configurado. Exclusão de imagens desativada.');
    return false;
  }

  try {
    // Extrair o caminho do arquivo da URL pública
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = imageUrl.split('/servicos/');
    if (urlParts.length !== 2) {
      console.warn('URL de imagem inválida:', imageUrl);
      return false;
    }

    const filePath = `servicos/${urlParts[1]}`;

    const { error } = await supabase.storage
      .from('servicos')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro ao deletar arquivo:', err);
    return false;
  }
};

module.exports = {
  uploadImages,
  deleteImage,
};
