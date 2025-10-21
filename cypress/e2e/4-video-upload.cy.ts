describe('Video Upload Tests', () => {
  beforeEach(() => {
    cy.visit('/upload-video')
  })

  it('should display initial upload page state', () => {
    cy.contains('Upload de Vídeo').should('be.visible')
    cy.contains('Clique para selecionar um vídeo').should('be.visible')
    cy.get('video').should('not.exist')
  })

  it('should handle video file selection and preview', () => {
    const testVideo = new File(['dummy video content'], 'video.mp4', { type: 'video/mp4' })
    cy.get('[data-testid="upload-area"]').then(($input) => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testVideo)
      const inputEl = $input[0] as HTMLInputElement
      inputEl.files = dataTransfer.files
      cy.wrap($input).trigger('change', { force: true })
    })
    cy.get('video').should('be.visible')
    cy.contains('video.mp4').should('be.visible')
    cy.get('[aria-label="Cancelar upload"]').should('be.visible')
  })

  it('should allow cancelling video selection', () => {
    const testVideo = new File(['dummy video content'], 'video.mp4', { type: 'video/mp4' })
    cy.get('[data-testid="upload-area"]').then(($input) => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testVideo)
      const inputEl = $input[0] as HTMLInputElement
      inputEl.files = dataTransfer.files
      cy.wrap($input).trigger('change', { force: true })
    })
    cy.get('[aria-label="Cancelar upload"]').click()
    cy.get('video').should('not.exist')
    cy.contains('Clique para selecionar um vídeo').should('be.visible')
  })

  it('should simulate video upload process', () => {
    const testVideo = new File(['dummy video content'], 'video.mp4', { type: 'video/mp4' })
    cy.get('[data-testid="upload-area"]').then(($input) => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testVideo)
      const inputEl = $input[0] as HTMLInputElement
      inputEl.files = dataTransfer.files
      cy.wrap($input).trigger('change', { force: true })
    })
    cy.contains('Enviar Vídeo').click()
    cy.get('[role="progressbar"]').should('be.visible')
    cy.contains('Vídeo enviado com sucesso!').should('be.visible')
  })
})