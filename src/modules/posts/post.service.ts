import { Post, IPost } from './post.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export class PostService {
	static async createPost(data: Partial<IPost>): Promise<IPost> {
		const postId = `post_${uuidv4()}`;
		const post = new Post({
			...data,
			postId,
		});
		await post.save();
		return post;
	}

	static async getPosts(filter: any = {}, options: any = {}): Promise<IPost[]> {
		return Post.find(filter, null, options).sort({ createdAt: -1 });
	}

	// Add more methods as needed (update, delete, etc.)
}
