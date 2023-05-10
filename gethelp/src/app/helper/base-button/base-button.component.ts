import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';

type Onclick = (params: any) => void;
@Component({
    selector: 'base-button',
    templateUrl: './base-button.component.html',
    styleUrls: ['./base-button.component.scss'],
})

export class BaseButtonComponent implements OnInit {
    @Input() onClick: Onclick; 
    @Input() className?: string;
    @Input() id?: string;
    @Input() label: string; 
    // @ContentChild('content') content!: TemplateRef<any>;
    
    constructor () {
        this.onClick = () => {};
        this.className = '';
        this.id = '';
        this.label = 'action';
    }

    ngOnInit(): void {
        
    }
}