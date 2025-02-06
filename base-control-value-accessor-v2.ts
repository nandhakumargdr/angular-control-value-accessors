import {AbstractControl, ControlValueAccessor, FormControl, NgControl} from "@angular/forms";
import {AfterContentInit, inject, output, signal} from "@angular/core";

export abstract class BaseControlValueAccessorV2<T> implements ControlValueAccessor {

  controlValue = signal<T | null>(null);
  actualValue: any;

  disabled = signal(false);
  touched = signal(false);
  public formControl = new FormControl();
  writeToInherited = false;

  ngControl = inject(NgControl, {optional: true, self: true});

  constructor() {
    if (this.ngControl) {
      this.ngControl!.valueAccessor = this;
    }
  }

  initFormControl() {
    let formControl = this.ngControl?.control as FormControl;
    if (formControl) {
      this.formControl = this.ngControl?.control as FormControl;
    }
  }

  get hasErrors() {
    return this.formControl && this.formControl.touched && this.formControl.errors;
  }

  onChange: any = () => {
  };

  onTouched: any = () => {
  };

  writeValue(value: T): void {
    // if (value !== null && value !== undefined && !this.writeToInherited) {
    //   this.controlValue.set(value);
    //   this.onValueReady(value);
    //   this.writeToInherited = true;
    // }

    // if (value !== null && value !== undefined) {
    //   this.actualValue = value;
    //   this.controlValue.set(value);
    //   this.onValueReady(value);
    //   this.writeToInherited = true;
    // }

    this.actualValue = value;
    this.controlValue.set(value);
    this.onValueReady(value);
  }

  createInstance<T>(ClassRef: new () => T): T {
    return new ClassRef(); // Create an instance of T
  }

  isOfType<T>(value: any, check: (value: any) => boolean): value is T {
    return check(value);
  }


  protected abstract onValueReady(value: T): void;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  markAsTouched() {
    if (!this.touched()) {
      this.onTouched();
      this.touched.set(true);
    }
  }

  hasRequiredValidator(): boolean {
    if (this.formControl?.validator) {
      const validator = this.formControl.validator({} as AbstractControl);
      return !!(validator && validator['required']);
    }
    return false;
  }

  updateValue(newValue: any) {
    this.controlValue.set(newValue);
    this.onChange(newValue);
  }

}


export type Schema<T> = {
  [K in keyof T]: (value: any) => boolean;
};

export function isValid<T>(value: any, schema: Schema<T>): value is T {
  if (typeof value !== 'object' || value === null) return false;

  return Object.keys(schema).every(key => {
    const typeCheck = schema[key as keyof T];
    return typeCheck(value[key as keyof T]);
  });
}

export function isDynamicType<T>(value: any, typeDefinition: new (...args: any[]) => T): boolean {
  // Check if typeDefinition is a class constructor
  if (typeof typeDefinition !== 'function') {
    return false; // Type definition must be a class constructor
  }

  // Check if value is an instance of the class
  if (!(value instanceof typeDefinition)) {
    return false; // Value must be an instance of typeDefinition
  }

  // Get the prototype of the type definition
  const prototype = typeDefinition.prototype;

  // Get the keys of the type definition's prototype
  const keys = Object.keys(prototype) as Array<keyof T>;

  // Check each property in the type definition
  for (const key of keys) {
    const expectedType = typeof prototype[key];
    const actualType = typeof value[key];

    // Check for nested object types
    if (expectedType === 'object' && actualType === 'object') {
      if (prototype[key] !== null && value[key] !== null) {
        // Recursively check for nested objects
        const isNestedObjectValid = isDynamicType(value[key], (prototype[key] as any).constructor);
        if (!isNestedObjectValid) {
          return false; // Nested object check failed
        }
      } else if (value[key] === null) {
        return false; // If expected to be an object, it shouldn't be null
      }
    } else if (expectedType !== actualType) {
      return false; // Type mismatch
    }
  }

  return true; // All checks passed
}

export function getDynamicTypeStructure(obj: any): string {
  if (obj === null) return 'null';

  if (Array.isArray(obj)) {
    return `Array<${obj.map(item => getDynamicTypeStructure(item)).join(', ')}>`;
  }

  if (typeof obj === 'object') {
    const properties = Object.keys(obj).map(key => {
      return `${key}: ${getDynamicTypeStructure(obj[key])}`;
    });
    return `Object { ${properties.join(', ')} }`;
  }

  return typeof obj; // For primitive types (number, string, etc.)
}
