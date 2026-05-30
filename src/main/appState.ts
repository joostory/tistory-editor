class AppState {
  private _showExitPrompt = false

  get showExitPrompt(): boolean {
    return this._showExitPrompt
  }

  set showExitPrompt(value: boolean) {
    this._showExitPrompt = value
  }
}

export const appState = new AppState()
