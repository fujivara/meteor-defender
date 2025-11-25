import { Observable, BehaviorSubject } from 'rxjs';

export class ObjectPool<T> {
  private pool: T[] = [];
  private activeObjects: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private activeSubject = new BehaviorSubject<T[]>([]);

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 10
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.initializePool(initialSize);
  }

  private initializePool(size: number): void {
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.createFn();
    }
    this.activeObjects.push(obj);
    this.resetFn(obj);
    this.activeSubject.next([...this.activeObjects]);
    return obj;
  }

  release(obj: T): void {
    const index = this.activeObjects.indexOf(obj);
    if (index > -1) {
      this.activeObjects.splice(index, 1);
      this.pool.push(obj);
      this.activeSubject.next([...this.activeObjects]);
    }
  }

  getActiveObjects(): Observable<T[]> {
    return this.activeSubject.asObservable();
  }

  getActiveObjectsSnapshot(): T[] {
    return [...this.activeObjects];
  }

  releaseAll(): void {
    this.pool.push(...this.activeObjects);
    this.activeObjects.length = 0;
    this.activeSubject.next([]);
  }
}