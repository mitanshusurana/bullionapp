import { Component, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { SyncService } from "./services/sync.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly _sync = inject(SyncService);
  protected readonly title = signal("fusion-angular-tailwind-starter");
}
