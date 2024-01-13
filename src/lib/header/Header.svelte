<script lang="ts">
import ModalClearData from './ModalClearData.svelte'

export let resetData: () => void
</script>

<nav
  class="navbar navbar-expand border-bottom"
  aria-label="main navigation"
>
  <div class="container-fluid">
    <h1 class="navbar-brand">White Elephant Presenter</h1>
    <ul class="navbar-nav">
      <li class="nav-item ms-2">
        <a
          class="btn btn-secondary"
          href="https://www.whiteelephantrules.com/"
          target="_blank"
          rel="noreferrer"
        >
          View rules
        </a>
      </li>
      <li class="nav-item ms-2">
        <button
          class="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#modal-clear-data"
        >
          Clear data
        </button>
        <ModalClearData {resetData} />
      </li>
    </ul>
  </div>
</nav>
