import { Issue, IIssue } from './issue.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export class IssueService {
	static async createIssue(data: Partial<IIssue>): Promise<IIssue> {
		const issueId = `issue_${uuidv4()}`;
		const issue = new Issue({
			...data,
			issueId,
		});
		await issue.save();
		return issue;
	}

	static async getIssues(filter: any = {}, options: any = {}): Promise<IIssue[]> {
		return Issue.find(filter, null, options).sort({ createdAt: -1 });
	}

	static async getIssueById(issueId: string): Promise<IIssue | null> {
		return Issue.findOne({ issueId });
	}

	static async updateIssue(issueId: string, updateData: Partial<IIssue>): Promise<IIssue | null> {
		return Issue.findOneAndUpdate(
			{ issueId },
			{ $set: updateData },
			{ new: true }
		);
	}

	static async deleteIssue(issueId: string): Promise<boolean> {
		const result = await Issue.findOneAndDelete({ issueId });
		return !!result;
	}
}
