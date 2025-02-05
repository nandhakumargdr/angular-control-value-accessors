import {AbstractControl, ControlValueAccessor, FormControl} from "@angular/forms";
import {signal} from "@angular/core";

export abstract class BaseControlValueAccessor implements ControlValueAccessor {

  disabled = signal(false);
  touched = signal(false);
  public formControl = new FormControl();
  writeToInherited = false;

  get hasErrors() {
    return this.formControl && this.formControl.touched && this.formControl.errors;
  }

  onChange: any = () => {
  };

  onTouched: any = () => {
  };

  writeValue(value: any): void {
    if (value !== null && value !== undefined && !this.writeToInherited) {
      this.onWriteValue(value);
      this.writeToInherited = true;
    }
  }

  protected abstract onWriteValue(obj: any): void;

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

}
