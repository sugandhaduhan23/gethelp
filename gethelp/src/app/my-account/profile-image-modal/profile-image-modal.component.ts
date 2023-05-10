import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';

export interface DialogData {
  path: string;
  id: string;
}

@Component({
  selector: 'profile-image-modal',
  templateUrl: 'profile-image-modal.component.html',
  styleUrls: ['profile-image-modal.component.scss']
})
export class ProfileImageModalComponent {
  profileImage = '/assets/image/avatar.png';
  selectedFile: File | null = null;
  downloadURL!: string;
  output: Partial<HTMLImageElement> | null;
  saveInProgress: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProfileImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private storage: AngularFireStorage
    ) {

    this.output = document.getElementById('output');
    if (this.output)
      this.output.src = data.path;
  }

  onImageLoadFailure (event: any) {
    event.target.src = this.profileImage;
    event.onerror = null; 
  }

  onNoClick(): void {
    this.dialogRef.close(this.data.path);
  }

  onFileSelected(event:any) {
    this.selectedFile = event.target.files[0];
    this.output = document.getElementById('output');

    if (this.output) {
      this.output.src = URL.createObjectURL(event.target.files[0]);
    }
  }

  submitForm() {
    this.saveInProgress = true;
    const filePath = `images/profiles/profile_${this.data.id}.${this.selectedFile?.name?.split('.').pop()}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.selectedFile);

    task.snapshotChanges().subscribe(() => {
      fileRef.getDownloadURL().subscribe((downloadURL:any) => {
        this.downloadURL = downloadURL;
        this.data.path = this.downloadURL;
        this.saveInProgress = false;
        this.onNoClick();
      });
    });
  }
}