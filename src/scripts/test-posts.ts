import { postsService } from '../modules/posts/posts.service';

async function test() {
  const posts = await postsService.list(1, 5);
  console.log(posts);

  const post = await postsService.create(1, 'Testing service');
  console.log(post);
}

test();
