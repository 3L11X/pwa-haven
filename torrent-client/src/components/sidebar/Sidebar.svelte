<script>
  import Button from './SidebarButton.svelte'
  const buttons = [
    {
      value: 'All',
      icon: 'toc'
    },
    {
      value: 'Downloading',
      icon: 'arrow_downward'
    },
    {
      value: 'Seeding',
      icon: 'arrow_upward'
    },
    {
      value: 'Completed',
      icon: 'done'
    },
    {
      value: 'Paused',
      icon: 'pause'
    }
  ]
</script>

<div class='sidebar bg-transparent d-flex flex-column justify-content-between py-20 bg-dark-dm bg-white-lm'>
  <div>
    {#each buttons as button}
      <Button icon={button.icon} value={button.value} />
    {/each}
  </div>
  <div>
    <Button icon='add' value='Add Torrent' />
    <Button icon='tune' value='Settings' />
  </div>
</div>
