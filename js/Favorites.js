import { GithubUser } from './GithubUser.js';


// classe que vai conter  a lógica dos dados
// como os dados serão estruturados

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load()

  }

  load() {

    this.entries = JSON.parse(localStorage.getItem('@github-fav')) || []

    /* this.entries = [
      {
        name: 'Paulo Caldi',
        login: 'pcaldi',
        repositories: 123,
        followers: 123
      }
    ] */
  }

  save() {
    localStorage.setItem('@github-fav', JSON.stringify(this.entries))
  }

  async add(username) {

    try {

      // Se o usuário já existe, não adiciona novamente
      const userExists = this.entries.find(entry => entry.login === username)
      // Se o usuário já existe, não adiciona novamente
      if (userExists) {
        throw new Error('Usuário já favoritado!')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]

      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }

  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody');


    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector('.input-wrapper button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.input-wrapper input')

      this.add(value)
    }
  }


  update() {
    this.removeAllTr()

    this.emptyState()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem do ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `@${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.seguidores ').textContent = user.followers

      row.querySelector('.remove button').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/pcaldi.png" alt="Imagem Github">
        <a href="https://github.com/pcaldi" target="blank">
          <p>Paulo Caldi</p>
          <span>pcaldi</span>
        </a>
      </td>
      <td class="repositories">123</td>
      <td class="seguidores">123</td>
      <td class="remove">
        <button><i class="ph ph-trash"></i></button>
      </td>
    `

    return tr
  }

  removeAllTr() {

    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    })
  }


  emptyState() {
    const emptyState = this.root.querySelector('.empty-state');
    const tableContent = this.entries.length === 0

    if (tableContent) {
      emptyState.classList.remove('hide');
    } else {
      emptyState.classList.add('hide');
    }
  }
}
