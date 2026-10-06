import JSZip from 'jszip';
import type { ComicMetadata } from '../../../domain/entities/Comic';
import type { BookChapter, BookData } from '../types/book';

export class BookFileService {
  /**
   * Procesa un archivo de libro (.epub o .txt) y genera sus metadatos y estructura de capítulos.
   */
  public async processBookFile(file: File): Promise<{
    metadata: ComicMetadata;
    bookData: BookData;
    coverUrl?: string;
  }> {
    const isEpub = file.name.toLowerCase().endsWith('.epub');
    const bookId = this.generateFileId(file);

    if (isEpub) {
      return this.processEpubFile(file, bookId);
    } else {
      return this.processTxtFile(file, bookId);
    }
  }

  /**
   * Parsea un archivo EPUB extrayendo título, autor, portada y capítulos.
   */
  private async processEpubFile(
    file: File,
    bookId: string
  ): Promise<{
    metadata: ComicMetadata;
    bookData: BookData;
    coverUrl?: string;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Localizar el archivo OPF en META-INF/container.xml
    let opfPath = 'OEBPS/content.opf';
    const containerEntry = zip.file('META-INF/container.xml');
    if (containerEntry) {
      const containerXml = await containerEntry.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(containerXml, 'application/xml');
      const rootfile = doc.querySelector('rootfile');
      if (rootfile) {
        opfPath = rootfile.getAttribute('full-path') || opfPath;
      }
    }

    const opfEntry = zip.file(opfPath);
    if (!opfEntry) {
      throw new Error('No se pudo encontrar el manifiesto de contenido (OPF) en el EPUB.');
    }

    const opfXml = await opfEntry.async('text');
    const parser = new DOMParser();
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    // Metadatos principales
    const titleEl = opfDoc.getElementsByTagName('dc:title')[0] || opfDoc.querySelector('title');
    const creatorEl = opfDoc.getElementsByTagName('dc:creator')[0] || opfDoc.querySelector('creator');
    const title = titleEl?.textContent?.trim() || this.cleanTitle(file.name);
    const author = creatorEl?.textContent?.trim() || undefined;

    // Directorio base de recursos relativos dentro del zip
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

    // Manifest: mapa id -> href y atributos
    const manifestItems = new Map<string, { href: string; mediaType: string; properties: string }>();
    const itemElements = opfDoc.querySelectorAll('manifest > item');
    let coverHref: string | null = null;

    itemElements.forEach((el) => {
      const id = el.getAttribute('id');
      const href = el.getAttribute('href');
      const mediaType = el.getAttribute('media-type') || '';
      const properties = el.getAttribute('properties') || '';

      if (id && href) {
        manifestItems.set(id, { href, mediaType, properties });
      }
    });

    // 1. Detección EPUB 3 estándar: item con properties="cover-image"
    for (const [, item] of manifestItems) {
      if (item.properties.includes('cover-image') && item.mediaType.startsWith('image/')) {
        coverHref = item.href;
        break;
      }
    }

    // 2. Detección EPUB 2 estándar: meta name="cover" content="id_del_item"
    if (!coverHref) {
      const metaCover = opfDoc.querySelector('meta[name="cover"]');
      if (metaCover) {
        const coverId = metaCover.getAttribute('content');
        if (coverId && manifestItems.has(coverId)) {
          const item = manifestItems.get(coverId)!;
          if (item.mediaType.startsWith('image/')) {
            coverHref = item.href;
          }
        }
      }
    }

    // 3. Detección por Guía (guide > reference type="cover")
    if (!coverHref) {
      const guideCover = opfDoc.querySelector('guide > reference[type="cover"]');
      if (guideCover) {
        const guideHref = guideCover.getAttribute('href');
        if (guideHref) {
          const cleanHref = guideHref.split('#')[0];
          // Si el href apunta directo a una imagen
          if (/\.(jpe?g|png|webp|avif)$/i.test(cleanHref)) {
            coverHref = cleanHref;
          } else {
            // Si apunta a un archivo XHTML de portada, parsear la imagen interna
            const fullGuidePath = this.resolvePath(opfDir, cleanHref);
            const coverHtmlEntry = this.findZipEntry(zip, fullGuidePath);
            if (coverHtmlEntry) {
              try {
                const coverHtmlText = await coverHtmlEntry.async('text');
                const htmlDoc = new DOMParser().parseFromString(coverHtmlText, 'text/html');
                const embeddedImg = htmlDoc.querySelector('img, image');
                const imgSrc = embeddedImg?.getAttribute('src') || embeddedImg?.getAttribute('xlink:href') || embeddedImg?.getAttribute('href');
                if (imgSrc) {
                  const guideDir = cleanHref.includes('/') ? cleanHref.substring(0, cleanHref.lastIndexOf('/') + 1) : '';
                  coverHref = this.resolvePath(guideDir, imgSrc);
                }
              } catch {
                // Silencioso
              }
            }
          }
        }
      }
    }

    // 4. Detección heurística en manifest por nombre de ID o href
    if (!coverHref) {
      for (const [id, item] of manifestItems) {
        if (item.mediaType.startsWith('image/')) {
          const lowerId = id.toLowerCase();
          const lowerHref = item.href.toLowerCase();
          if (
            lowerId.includes('cover') ||
            lowerHref.includes('cover') ||
            lowerId.includes('portada') ||
            lowerHref.includes('portada') ||
            lowerHref.includes('jacket') ||
            lowerHref.includes('titlepage')
          ) {
            coverHref = item.href;
            break;
          }
        }
      }
    }

    // 5. Extraer imagen de portada encontrada
    let coverUrl: string | undefined;
    if (coverHref) {
      const fullCoverPath = this.resolvePath(opfDir, coverHref);
      const coverEntry = this.findZipEntry(zip, fullCoverPath);
      if (coverEntry) {
        const coverBlob = await coverEntry.async('blob');
        coverUrl = await this.blobToDataUrl(coverBlob);
      }
    }

    // 6. Búsqueda directa en los archivos del ZIP si aún no se ha localizado
    if (!coverUrl) {
      const zipFiles = Object.keys(zip.files);
      const coverCandidate = zipFiles.find((fname) =>
        /(?:^|[\\/])(?:cover|portada|front|jacket|titlepage)\.(?:jpe?g|png|webp)$/i.test(fname) &&
        !zip.files[fname].dir
      );

      if (coverCandidate) {
        const coverEntry = zip.files[coverCandidate];
        if (coverEntry) {
          const coverBlob = await coverEntry.async('blob');
          coverUrl = await this.blobToDataUrl(coverBlob);
        }
      }
    }

    // 7. Fallback vectorial estético si el libro carece de imagen
    if (!coverUrl) {
      coverUrl = this.generateBookCoverSvg(title, author);
    }

    // Spine: orden de lectura de los capítulos
    const itemrefs = opfDoc.querySelectorAll('spine > itemref');
    const chapters: BookChapter[] = [];
    let chapterIndex = 0;

    for (let i = 0; i < itemrefs.length; i++) {
      const idref = itemrefs[i].getAttribute('idref');
      if (!idref) continue;

      const item = manifestItems.get(idref);
      if (!item) continue;

      const fullChapterPath = this.resolvePath(opfDir, item.href);
      const chapterEntry = this.findZipEntry(zip, fullChapterPath);
      if (!chapterEntry) continue;

      const chapterDir = fullChapterPath.includes('/')
        ? fullChapterPath.substring(0, fullChapterPath.lastIndexOf('/') + 1)
        : '';

      const rawHtml = await chapterEntry.async('text');
      const { cleanedHtml, chapterTitle, wordCount } = await this.cleanChapterHtml(
        rawHtml,
        chapterIndex + 1,
        zip,
        chapterDir
      );

      // Si el capítulo contiene texto relevante
      if (wordCount > 5 || cleanedHtml.length > 50) {
        chapters.push({
          id: `ch_${chapterIndex}`,
          index: chapterIndex,
          title: chapterTitle,
          content: cleanedHtml,
          wordCount,
        });
        chapterIndex++;
      }
    }

    // Fallback si no hubo capítulos válidos
    if (chapters.length === 0) {
      chapters.push({
        id: 'ch_0',
        index: 0,
        title: 'Inicio',
        content: `<p>${title}</p>`,
        wordCount: 1,
      });
    }

    const totalWords = chapters.reduce((acc, ch) => acc + ch.wordCount, 0);

    const bookData: BookData = {
      bookId,
      title,
      author,
      format: 'epub',
      chapters,
      totalChapters: chapters.length,
      totalWords,
      coverUrl,
    };

    const metadata: ComicMetadata = {
      id: bookId,
      title,
      fileName: file.name,
      fileSize: file.size,
      format: 'epub',
      mediaType: 'book',
      totalPages: chapters.length,
      coverUrl,
      lastReadPageIndex: 0,
      progressPercentage: 0,
      addedAt: Date.now(),
      series: author,
    };

    return { metadata, bookData, coverUrl };
  }

  /**
   * Procesa un archivo de texto plano (.txt).
   */
  private async processTxtFile(
    file: File,
    bookId: string
  ): Promise<{
    metadata: ComicMetadata;
    bookData: BookData;
    coverUrl?: string;
  }> {
    const rawText = await file.text();
    const cleanRaw = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const title = this.cleanTitle(file.name);

    // Detección heurística de capítulos
    const chapterSplits = cleanRaw.split(
      /\n(?=(?:cap[ií]tulo|chapter|parte|secci[oó]n|\d+[.\-\s])[^\n]{0,60}\n)/i
    );

    let chapters: BookChapter[] = [];

    if (chapterSplits.length > 1) {
      chapters = chapterSplits.map((block, idx) => {
        const firstLineEnd = block.indexOf('\n');
        const header = firstLineEnd > 0 ? block.substring(0, firstLineEnd).trim() : `Capítulo ${idx + 1}`;
        const bodyText = firstLineEnd > 0 ? block.substring(firstLineEnd).trim() : block.trim();
        const paragraphs = bodyText
          .split(/\n{2,}/)
          .map((p) => `<p>${this.escapeHtml(p.trim())}</p>`)
          .join('');

        const words = bodyText.split(/\s+/).filter(Boolean).length;

        return {
          id: `ch_${idx}`,
          index: idx,
          title: header || `Capítulo ${idx + 1}`,
          content: paragraphs || '<p></p>',
          wordCount: words,
        };
      });
    } else {
      // Si no hay divisiones explícitas de capítulos, segmentar en bloques de ~3500 caracteres
      const CHUNK_SIZE = 3500;
      let offset = 0;
      let idx = 0;

      while (offset < cleanRaw.length) {
        let end = Math.min(offset + CHUNK_SIZE, cleanRaw.length);
        if (end < cleanRaw.length) {
          const nextBreak = cleanRaw.indexOf('\n\n', end - 300);
          if (nextBreak !== -1 && nextBreak < end + 300) {
            end = nextBreak + 2;
          }
        }

        const chunkText = cleanRaw.substring(offset, end).trim();
        const paragraphs = chunkText
          .split(/\n+/)
          .map((p) => `<p>${this.escapeHtml(p.trim())}</p>`)
          .join('');

        const words = chunkText.split(/\s+/).filter(Boolean).length;

        chapters.push({
          id: `ch_${idx}`,
          index: idx,
          title: `Sección ${idx + 1}`,
          content: paragraphs,
          wordCount: words,
        });

        offset = end;
        idx++;
      }
    }

    if (chapters.length === 0) {
      chapters.push({
        id: 'ch_0',
        index: 0,
        title: 'Texto completo',
        content: `<p>${this.escapeHtml(cleanRaw)}</p>`,
        wordCount: cleanRaw.split(/\s+/).filter(Boolean).length,
      });
    }

    const coverUrl = this.generateBookCoverSvg(title, 'Texto');
    const totalWords = chapters.reduce((acc, ch) => acc + ch.wordCount, 0);

    const bookData: BookData = {
      bookId,
      title,
      format: 'txt',
      chapters,
      totalChapters: chapters.length,
      totalWords,
      coverUrl,
    };

    const metadata: ComicMetadata = {
      id: bookId,
      title,
      fileName: file.name,
      fileSize: file.size,
      format: 'txt',
      mediaType: 'book',
      totalPages: chapters.length,
      coverUrl,
      lastReadPageIndex: 0,
      progressPercentage: 0,
      addedAt: Date.now(),
    };

    return { metadata, bookData, coverUrl };
  }

  /**
   * Sanitiza el HTML del capítulo de EPUB reteniendo formato semántico para máxima personalización
   * e inserta imágenes resueltas desde el propio archivo ZIP del libro.
   */
  private async cleanChapterHtml(
    rawHtml: string,
    defaultChapterNum: number,
    zip?: any,
    chapterDir: string = ''
  ): Promise<{
    cleanedHtml: string;
    chapterTitle: string;
    wordCount: number;
  }> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Remover scripts, styles e iframes que puedan causar incompatibilidad
    doc.querySelectorAll('script, style, iframe, object, embed, noscript').forEach((el) => el.remove());

    // Obtener título de capítulo
    const h1 = doc.querySelector('h1, h2, h3, title');
    const chapterTitle = h1?.textContent?.trim() || `Capítulo ${defaultChapterNum}`;

    const body = doc.body;
    if (!body) {
      return { cleanedHtml: '<p></p>', chapterTitle, wordCount: 0 };
    }

    // Resolver imágenes internas si el zip está disponible
    if (zip) {
      const imgElements = Array.from(body.querySelectorAll('img, image'));
      for (const img of imgElements) {
        const rawSrc = img.getAttribute('src') || img.getAttribute('xlink:href') || img.getAttribute('href');
        if (rawSrc && !rawSrc.startsWith('data:') && !rawSrc.startsWith('http://') && !rawSrc.startsWith('https://')) {
          const resolvedImgPath = this.resolvePath(chapterDir, rawSrc);
          const imgEntry = this.findZipEntry(zip, resolvedImgPath);
          if (imgEntry) {
            try {
              const blob = await imgEntry.async('blob');
              const dataUrl = await this.blobToDataUrl(blob);
              img.setAttribute('src', dataUrl);
              img.removeAttribute('srcset');
              img.removeAttribute('width');
              img.removeAttribute('height');
              img.setAttribute('class', 'max-w-full h-auto mx-auto my-3 block rounded-md object-contain');
            } catch {
              // Silencioso
            }
          }
        }
      }
    }

    // Convertir elementos a estructura semántica limpia
    const textContent = body.textContent || '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    // Normalizar clases e inline styles en los hijos
    const allowedTags = new Set([
      'p', 'h1', 'h2', 'h3', 'h4', 'blockquote',
      'em', 'strong', 'b', 'i', 'span', 'ul', 'ol', 'li',
      'img', 'figure', 'figcaption', 'hr'
    ]);
    const elements = Array.from(body.getElementsByTagName('*'));

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        // Eliminar tags no estándar conservando texto
        el.removeAttribute('style');
        el.removeAttribute('class');
      } else if (tag !== 'img') {
        el.removeAttribute('style');
        el.removeAttribute('class');
      }
    });

    return {
      cleanedHtml: body.innerHTML,
      chapterTitle,
      wordCount,
    };
  }

  /**
   * Resuelve rutas relativas estándar en ZIP/EPUB.
   */
  private resolvePath(baseDir: string, relativePath: string): string {
    if (!baseDir) return relativePath;
    if (relativePath.startsWith('/')) return relativePath.substring(1);

    const parts = (baseDir + relativePath).split('/');
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.' && part !== '') {
        resolved.push(part);
      }
    }

    return resolved.join('/');
  }

  /**
   * Genera una portada vectorial SVG minimalista y estética cuando el libro no incluye imagen propia.
   */
  public generateBookCoverSvg(title: string, author?: string): string {
    const cleanTitle = this.escapeHtml(title.substring(0, 48));
    const cleanAuthor = author ? this.escapeHtml(author.substring(0, 32)) : 'Gomic Book';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
      <defs>
        <linearGradient id="bookBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181B" />
          <stop offset="100%" stop-color="#09090B" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#bookBg)" />
      <line x1="32" y1="40" x2="32" y2="560" stroke="#27272A" stroke-width="2" />
      <line x1="40" y1="40" x2="40" y2="560" stroke="#3F3F46" stroke-width="1" />
      
      <circle cx="200" cy="180" r="32" fill="#27272A" />
      <path d="M190 180 L200 170 L210 180 L200 190 Z" fill="#71717A" />
      
      <text x="200" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#F4F4F5" text-anchor="middle">
        ${cleanTitle}
      </text>
      
      <text x="200" y="315" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="400" fill="#A1A1AA" text-anchor="middle">
        ${cleanAuthor}
      </text>
      
      <rect x="160" y="520" width="80" height="2" fill="#3F3F46" />
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private cleanTitle(fileName: string): string {
    return fileName
      .replace(/\.(epub|txt|pdf)$/i, '')
      .replace(/[_]+/g, ' ')
      .trim();
  }

  private generateFileId(file: File): string {
    const raw = `${file.name}_${file.size}_${file.lastModified}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `book_${Math.abs(hash).toString(36)}`;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Busca un archivo dentro del ZIP de forma insensible a mayúsculas y normalizando separadores.
   */
  private findZipEntry(zip: JSZip, targetPath: string): JSZip.JSZipObject | null {
    const exact = zip.file(targetPath);
    if (exact) return exact;

    const normalized = targetPath.replace(/\\/g, '/').toLowerCase();
    for (const filename of Object.keys(zip.files)) {
      if (filename.replace(/\\/g, '/').toLowerCase() === normalized) {
        return zip.files[filename];
      }
    }
    return null;
  }
}

export const bookFileService = new BookFileService();
