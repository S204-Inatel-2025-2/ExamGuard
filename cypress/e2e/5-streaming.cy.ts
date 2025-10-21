describe('Streaming Video Tests', () => {
  beforeEach(() => {
    cy.visit('/upload-streaming')
  })

  it('should display initial streaming page state', () => {
    cy.contains('Gravar Aula').should('be.visible')
    cy.contains('Câmera desligada').should('be.visible')
    cy.contains('Iniciar Gravação').should('be.enabled')
    cy.contains('Parar Gravação').should('not.exist')
  })

  describe('Camera Access', () => {
    it('should handle successful camera access', () => {
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .resolves(new MediaStream())
      })
      cy.contains('Iniciar Gravação').click()
      cy.contains('GRAVANDO').should('be.visible')
      cy.contains('Parar Gravação').should('be.visible')
    })

    it('should handle camera access denial', () => {
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .rejects(new Error('NotAllowedError'))
      })
      cy.contains('Iniciar Gravação').click()
      cy.contains('Não foi possível acessar a câmera').should('be.visible')
      cy.contains('Câmera desligada').should('be.visible')
    })
  })

  describe('Recording Flow', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .resolves(new MediaStream())
      })
    })

    it('should handle complete recording flow', () => {
      cy.contains('Iniciar Gravação').click()
      cy.contains('GRAVANDO').should('be.visible')
      cy.wait(2000)
      cy.contains('Parar Gravação').click()
      cy.contains('Gravação finalizada!').should('be.visible')
      cy.contains('Descartar').should('be.visible')
      cy.contains('Enviar Vídeo').should('be.visible')
    })

    it('should handle discarding recording', () => {
      cy.contains('Iniciar Gravação').click()
      cy.wait(2000)
      cy.contains('Parar Gravação').click()
      cy.contains('Descartar').click()
      cy.contains('Câmera desligada').should('be.visible')
      cy.contains('Iniciar Gravação').should('be.enabled')
    })

    it('should handle successful video upload', () => {
      cy.contains('Iniciar Gravação').click()
      cy.wait(2000)
      cy.contains('Parar Gravação').click()
      cy.contains('Enviar Vídeo').click()
      cy.get('[role="progressbar"]').should('be.visible')
      cy.contains('Vídeo enviado com sucesso! ✅').should('be.visible')
      cy.contains('Câmera desligada').should('be.visible')
    })
  })
})