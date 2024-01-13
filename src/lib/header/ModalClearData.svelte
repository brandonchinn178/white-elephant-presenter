<script lang="ts">
export let resetData: () => void

let modalEl: HTMLDivElement
</script>

<div
  bind:this={modalEl}
  id="modal-clear-data"
  class="modal"
  tabIndex="-1"
  aria-label="Clear data"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5>Are you sure?</h5>
      </div>
      <div class="modal-body">
        This will completely clear all the data on the site.
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          on:click={() => {
            resetData()
            bootstrap.Modal.getInstance(modalEl).hide()
          }}
        >
          Clear data
        </button>
      </div>
    </div>
  </div>
</div>
