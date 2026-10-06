import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUsersService } from '../../core/services/admin-users.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  private readonly usersService = inject(AdminUsersService);
  private readonly fb = inject(FormBuilder);

  readonly users = this.usersService.users;
  readonly searchTerm = signal('');

  readonly filteredUsers = computed(() => {
    let list = this.users();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    return list;
  });

  readonly isModalOpen = signal(false);
  readonly selectedUser = signal<User | null>(null);

  readonly userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['vendedor', Validators.required],
    isActive: [true]
  });

  updateSearch(event: Event) {
    const el = event.target as HTMLInputElement;
    this.searchTerm.set(el.value);
  }

  openModal(user?: User) {
    if (user) {
      this.selectedUser.set(user);
      this.userForm.patchValue(user);
    } else {
      this.selectedUser.set(null);
      this.userForm.reset({ role: 'vendedor', isActive: true });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveUser() {
    if (this.userForm.invalid) return;
    
    const formValue = this.userForm.value as Partial<User>;

    if (this.selectedUser()) {
      this.usersService.updateUser(this.selectedUser()!.id, formValue);
    } else {
      this.usersService.addUser(formValue);
    }
    this.closeModal();
  }

  toggleStatus(id: string) {
    this.usersService.toggleUserStatus(id);
  }

  deleteUser(id: string) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.usersService.users.update(items => items.filter(u => u.id !== id));
    }
  }

  selectRole(role: 'admin' | 'vendedor') {
    this.userForm.patchValue({ role });
  }
}
