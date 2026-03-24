import { CacheableItem } from "cacheable";

export abstract class ICacheService {
    /**
     * Saves data to the cache.
     * @param key 
     * @param value 
     * @param expired expiration time
     * @return Promise<T>
     */
    abstract set<T>(key: string, value: T, expired?: number | string): Promise<boolean>

    /**
     * 
     * Sets the values of the keys. If the secondary store is set then it will also set the values in the secondary store.
     * @param {CacheableItem[]} items The items to set
     * @returns {boolean} Whether the values were set
     */
    abstract setMany(items: CacheableItem[]): Promise<boolean>;

    /**
     * Get data from the cache.
     * @param key
     * @return Promise<string | null>
     */
	abstract get(key: string): Promise<string | null>

    /**
     * Delete data from the cache
     * @param key
     * @return Promise<boolean>
     */
	abstract delete(key: string): Promise<boolean>


    /**
     * Deletes the keys from the primary store. If the secondary store is set then it will also delete the keys from the secondary store.
     * @param {string[]} keys The keys to delete
     * @returns {Promise<boolean>} Whether the keys were deleted
     */
    abstract deleteMany(keys: string[]): Promise<boolean>
}