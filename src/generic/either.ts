export abstract class Either<T> {
  abstract map<P>(f: (value: T) => Either<P>): Either<P>;
  abstract then(f: (value: T) => void): Either<T>;
  abstract catch(f: (value: unknown) => void): Either<T>;
}

export class Right<T> extends Either<T> {
  private value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  map<P>(f: (value: T) => Either<P>): Either<P> {
    return f(this.value);
  }

  then(f: (value: T) => void): Either<T> {
    f(this.value);
    return this;
  }

  catch(): Either<T> {
    return this;
  }
}

export class Left<T> extends Either<T> {
  private error: unknown;

  constructor(error: any) {
    super();
    this.error = error;
  }

  map<P>(): Either<P> {
    return new Left<P>(this.error);
  }

  then(): Either<T> {
    return this;
  }

  catch(f: (value: unknown) => void): Either<T> {
    f(this.error);
    return this;
  }
}
