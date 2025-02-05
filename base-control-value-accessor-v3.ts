import {AbstractControl, ControlValueAccessor, FormControl, NgControl} from "@angular/forms";
import {AfterContentInit, Component, inject, input, output, signal} from "@angular/core";


@Component({
  imports: [],
  template: '',
})
export abstract class BaseControlValueAccessorV3<T> implements ControlValueAccessor, AfterContentInit {
  errorMessages = input<{ [key: string]: string }>({});

  valueChanged = output<T | undefined>();

  disabled = signal(false);
  touched = signal(false);
  public formControl = new FormControl();

  ngControl = inject(NgControl, {optional: true, self: true});

  actualValue: T | undefined;

  get value(): T | undefined {
    return this.formControl.value ?? this.actualValue;
  }

  constructor() {
    if (this.ngControl) {
      this.ngControl!.valueAccessor = this;
    }
  }

  ngAfterContentInit() {
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
    if (value != this.value) {
      this.formControl.setValue(value);
      this.actualValue = value;
    }
  }


  onValueChange(value: T) {
    this.valueChanged.emit(value);
    this.actualValue = value;
    this.onChange(value);
  }

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
    this.onChange(newValue);
  }

}
