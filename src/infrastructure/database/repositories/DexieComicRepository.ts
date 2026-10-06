import { db, type StoredComic } from '../ComicDatabase';

export class DexieComicRepository {
  public async getAllComics(): Promise<StoredComic[]> {
    return db.comics.orderBy('addedAt').reverse().toArray();
  }

  public async getComicById(id: string): Promise<StoredComic | undefined> {
    return db.comics.get(id);
  }

  public async saveComic(comic: StoredComic, fileBlob?: Blob): Promise<void> {
    await db.transaction('rw', db.comics, db.comicFiles, async () => {
      await db.comics.put(comic);
      if (fileBlob) {
        await db.comicFiles.put({
          comicId: comic.id,
          fileBlob,
          updatedAt: Date.now(),
        });
      }
    });
  }

  public async updateProgress(
    id: string,
    pageIndex: number,
    totalPages: number
  ): Promise<void> {
    const comic = await db.comics.get(id);
    if (!comic) return;

    const progressPercentage = Math.min(
      100,
      Math.round(((pageIndex + 1) / Math.max(1, totalPages)) * 100)
    );

    await db.comics.update(id, {
      lastReadPageIndex: pageIndex,
      progressPercentage,
      lastReadAt: Date.now(),
    });
  }

  public async toggleFavorite(id: string): Promise<boolean> {
    const comic = await db.comics.get(id);
    if (!comic) return false;

    const newFavorite = !comic.isFavorite;
    await db.comics.update(id, { isFavorite: newFavorite });
    return newFavorite;
  }

  public async toggleBookmark(id: string, pageIndex: number): Promise<number[]> {
    const comic = await db.comics.get(id);
    if (!comic) return [];

    const currentBookmarks = comic.bookmarks || [];
    const exists = currentBookmarks.includes(pageIndex);
    const newBookmarks = exists
      ? currentBookmarks.filter((p) => p !== pageIndex)
      : [...currentBookmarks, pageIndex].sort((a, b) => a - b);

    await db.comics.update(id, { bookmarks: newBookmarks });
    return newBookmarks;
  }

  public async getBookmarks(id: string): Promise<number[]> {
    const comic = await db.comics.get(id);
    return comic?.bookmarks || [];
  }

  public async updateCollection(id: string, collection: string | undefined): Promise<void> {
    await db.comics.update(id, {
      collection: collection?.trim() || undefined,
      series: collection?.trim() || undefined,
    });
  }

  public async deleteComic(id: string): Promise<void> {
    await db.transaction('rw', db.comics, db.comicFiles, async () => {
      await db.comics.delete(id);
      await db.comicFiles.delete(id);
    });
  }

  public async getComicFile(id: string): Promise<Blob | undefined> {
    const record = await db.comicFiles.get(id);
    return record?.fileBlob;
  }
}

export const comicRepository = new DexieComicRepository();
