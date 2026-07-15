import type { BaseEntity, DatabaseShape } from "@/types/domain";
import { createId } from "@/utils/ids";

import { createSeedDatabase } from "./mockData";

const STORAGE_KEY = "nagy-eventos-database";

type CollectionKey = {
  [Key in keyof DatabaseShape]: DatabaseShape[Key] extends BaseEntity[]
    ? Key
    : never;
}[keyof DatabaseShape];

type CollectionItem<Key extends CollectionKey> = DatabaseShape[Key][number];
type EntityInput<T extends BaseEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readDatabase(): DatabaseShape {
  if (!canUseStorage()) {
    return createSeedDatabase();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedDatabase();
    writeDatabase(seed);
    return seed;
  }

  return JSON.parse(stored) as DatabaseShape;
}

export function writeDatabase(database: DatabaseShape) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function updateDatabase(
  updater: (database: DatabaseShape) => DatabaseShape,
) {
  const next = updater(readDatabase());
  writeDatabase(next);
  return next;
}

export const localRepository = {
  async list<Key extends CollectionKey>(
    key: Key,
  ): Promise<CollectionItem<Key>[]> {
    return readDatabase()[key];
  },

  async get<Key extends CollectionKey>(
    key: Key,
    id: string,
  ): Promise<CollectionItem<Key> | null> {
    const collection = readDatabase()[key] as CollectionItem<Key>[];
    return collection.find((item) => item.id === id) ?? null;
  },

  async create<Key extends CollectionKey>(
    key: Key,
    input: EntityInput<CollectionItem<Key>>,
    prefix: string,
  ): Promise<CollectionItem<Key>> {
    const now = new Date().toISOString();
    const entity = {
      ...input,
      id: createId(prefix),
      createdAt: now,
      updatedAt: now,
    } as CollectionItem<Key>;

    updateDatabase((database) => {
      const collection = database[key] as CollectionItem<Key>[];
      return {
        ...database,
        [key]: [entity, ...collection],
      } as DatabaseShape;
    });

    return entity;
  },

  async update<Key extends CollectionKey>(
    key: Key,
    id: string,
    input: Partial<EntityInput<CollectionItem<Key>>>,
  ): Promise<CollectionItem<Key> | null> {
    let updatedEntity: CollectionItem<Key> | null = null;
    const now = new Date().toISOString();

    updateDatabase((database) => {
      const collection = database[key] as CollectionItem<Key>[];
      const nextCollection = collection.map((item) => {
        if (item.id !== id) {
          return item;
        }

        updatedEntity = {
          ...item,
          ...input,
          updatedAt: now,
        } as CollectionItem<Key>;

        return updatedEntity;
      });

      return {
        ...database,
        [key]: nextCollection,
      } as DatabaseShape;
    });

    return updatedEntity as CollectionItem<Key> | null;
  },

  async remove<Key extends CollectionKey>(key: Key, id: string): Promise<void> {
    updateDatabase((database) => {
      const collection = database[key] as CollectionItem<Key>[];
      return {
        ...database,
        [key]: collection.filter((item) => item.id !== id),
      } as DatabaseShape;
    });
  },
};
